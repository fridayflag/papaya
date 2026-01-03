import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Request, type RequestHandler, type Response } from 'express'
import { createProxyMiddleware, type Options } from 'http-proxy-middleware'
import jwt from 'jsonwebtoken'
import path from 'path'
import AuthController from './controllers/AuthController.js'
import {
  AUTH_ACCESS_TOKEN_SECRET,
  NODE_ENV,
  PAPAYA_COUCHDB_URL,
  PAPAYA_SERVER_PORT,
  SERVER_NAME
} from './support/env.js'
import { UserClaims } from './support/types'

// CORS
const ALLOWED_ORIGINS = ['http://localhost:9475', 'https://app.papaya.axoneme.org', 'http://192.168.68.68:9475', 'http://192.168.68.68:9476'];
const ENABLE_CORS = true

// Token expiration times
const JWT_EXPIRATION_SECONDS = 60;
const REFRESH_EXPIRATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Cookies
const ACCESS_TOKEN_COOKIE = 'AccessToken'
const REFRESH_TOKEN_COOKIE = 'RefreshToken'

// Initialize controllers
const authController = new AuthController()

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (ENABLE_CORS) {
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.some((allowed) => [origin, '*'].includes(allowed))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies and other credentials
  }));
}

const isTokenExpired = (token: string, secret: string): boolean => {
  try {
    jwt.verify(token, secret);
    return false;
  } catch (error) {
    return error instanceof jwt.TokenExpiredError;
  }
};

const tokenMiddlewareHandler: RequestHandler = async (req, res, next) => {
  const accessToken = req.cookies[ACCESS_TOKEN_COOKIE];
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

  // Extract user from access token if present
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, AUTH_ACCESS_TOKEN_SECRET) as UserClaims;
      req.user = decoded;
    } catch (error) {
      // Token is invalid, will be handled below
    }
  }

  if (!refreshToken) {
    return next();
  }

  try {
    // Find the user by refresh token - we'll do this only once
    const user = await authController.findUserByRefreshToken(refreshToken);

    if (!user) {
      // Token not found or reuse detected
      console.log('Token not found or reuse detected.');
      // Try to get the username from the token to invalidate all tokens
      try {
        const claims = await authController.decodeRefreshToken(refreshToken);
        if (claims?.name) {
          await authController.invalidateAllRefreshTokensForUser(claims.name);
        }
      } catch (error) {
        console.error("Failed to decode refresh token:", error);
      }
      return next();
    }

    let updatedUser = user;
    let newRefreshToken = refreshToken;

    // Check if access token is expired or absent
    const needNewAccessToken = !accessToken || isTokenExpired(accessToken, AUTH_ACCESS_TOKEN_SECRET);

    // Only rotate the refresh token if we need a new access token
    if (needNewAccessToken) {
      // Rotate the refresh token (sliding window)
      const rotationResult = await authController.rotateRefreshToken(refreshToken, user);

      if (!rotationResult) {
        // Something went wrong with token rotation
        return next();
      }

      newRefreshToken = rotationResult.newToken;
      updatedUser = rotationResult.updatedUser;

      // Set the new refresh token cookie
      res.cookie(REFRESH_TOKEN_COOKIE, newRefreshToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        maxAge: REFRESH_EXPIRATION_SECONDS * 1000,
      });

      // Create new access token using the refresh token
      const newAccessToken = await authController.createAccessTokenFromRefreshToken(newRefreshToken, updatedUser);

      // Store the new token in res.locals for immediate use
      res.locals.authToken = newAccessToken;

      res.cookie(ACCESS_TOKEN_COOKIE, newAccessToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        maxAge: JWT_EXPIRATION_SECONDS * 1000,
      });
    }

    // Save any changes to the user record
    if (updatedUser !== user) {
      await authController.updateUserRecord(updatedUser);
    }
  } catch (error) {
    console.error("Error in token middleware:", error);
    // Clear cookies on error
    res.cookie(ACCESS_TOKEN_COOKIE, '', { maxAge: 0 });
    res.cookie(REFRESH_TOKEN_COOKIE, '', { maxAge: 0 });
  }

  next();
};

// Admin role check middleware
const adminRoleMiddleware: RequestHandler = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (!req.user.roles.includes('papaya:admin')) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  next();
};

// Create the proxy middleware with proper typing
const proxyMiddlewareOptions: Options = {
  target: PAPAYA_COUCHDB_URL, // e.g. 'http://localhost:5984'
  changeOrigin: true,
  pathRewrite: {
    '^/proxy': '', // Remove the 'proxy' prefix when forwarding
  },
  on: {
    proxyReq: (proxyReq, req: Request, res: Response) => {
      // Use the newly generated token if available, otherwise use the cookie
      const authToken = res.locals.authToken ?? req.cookies[ACCESS_TOKEN_COOKIE];

      if (authToken) {
        // Remove existing authorization header if present
        proxyReq.removeHeader('Authorization');

        // Add Bearer token
        proxyReq.setHeader('Authorization', `Bearer ${authToken}`);
      }

      // If it's a POST/PUT/PATCH request with a body, we need to restream the body
      if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    error: (err, req: Request, res: Response) => {
      res.status(500).send('Proxy Error');
    }
  }
};

app.use('/proxy', tokenMiddlewareHandler, createProxyMiddleware(proxyMiddlewareOptions));

// API routes
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/', (req: Request, res: Response) => {
  res.json({
    papaya: 'Welcome',
    version: '0.3.0',
    serverName: SERVER_NAME,
    status: 'ok',
    initialized: true,
  });
});

apiRouter.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    try {
      // Use the AuthController's login method
      const sessionResponse = await authController.login({ username, password });

      // Create user claims for the access token
      const userClaims: UserClaims = {
        name: sessionResponse.userCtx.name,
        roles: [...sessionResponse.userCtx.roles],
      };

      // Create access token
      const accessToken = jwt.sign(
        userClaims,
        AUTH_ACCESS_TOKEN_SECRET as jwt.Secret,
        {
          expiresIn: JWT_EXPIRATION_SECONDS,
          subject: username,
          algorithm: 'HS256',
          keyid: 'papaya'
        }
      );

      // Create refresh token
      const refreshToken = await authController.createRefreshTokenForUser(sessionResponse.userCtx.name);

      // Set cookies
      res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        maxAge: JWT_EXPIRATION_SECONDS * 1000,
      });

      res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        maxAge: REFRESH_EXPIRATION_SECONDS * 1000,
      });

      // Return success response
      res.status(200).json(sessionResponse);
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ error: 'Authentication failed' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

apiRouter.post("/logout", async (req: Request, res: Response, next): Promise<void> => {
  // Clear auth token cookie
  res.cookie(ACCESS_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    maxAge: 0,
  });

  // Clear refresh token cookie
  res.cookie(REFRESH_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    maxAge: 0,
  });

  if (req.cookies[REFRESH_TOKEN_COOKIE]) {
    const user = await authController.findUserByRefreshToken(req.cookies[REFRESH_TOKEN_COOKIE])
    if (user) {
      await authController.invalidateAllRefreshTokensForUser(user.name)
    }
  }

  res.status(200).json({ ok: true });
});

// Configuration is now handled via environment variables

apiRouter.post("/admin/restart", tokenMiddlewareHandler, adminRoleMiddleware, (req: Request, res: Response) => {
  // Send a response before restarting
  res.json({ success: true, message: 'Server restarting...' });

  // Wait a moment to ensure the response is sent
  setTimeout(() => {
    console.log('Restarting server...');
    process.exit(0);
  }, 1000);
});

// Mount the API router
app.use('/api', apiRouter);


// ============ Static ================


const webAssetsPath = path.join(process.cwd(), 'web-assets')
const indexPath = path.join(webAssetsPath, 'index.html')

console.log(`Web assets path: ${webAssetsPath}`)

// Serve static assets like CSS, JS, images, etc.
app.use(express.static(webAssetsPath))

// Serve index.html for any non-API route
app.get('*', (req, res) => {
  // If the path starts with /api/, it means the API router didn't handle it
  // So we should return a 404 for API routes that don't exist
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    // For all other routes, serve the SPA index.html
    res.sendFile(indexPath);
  }
})


// ============ Serve ================

// Start the server
const startServer = async () => {
  try {
    // Start the server
    app.listen(PAPAYA_SERVER_PORT, () => {
      console.log(`Server running on port ${PAPAYA_SERVER_PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
