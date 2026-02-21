package api

import (
	"encoding/base64"
	"errors"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/fridayflag/papaya/internal/auth"
	"github.com/fridayflag/papaya/internal/env"
	"github.com/gin-gonic/gin"
)

// Context keys for admin credentials (set by adminAuthMiddleware).
type adminContextKey string

const (
	adminUsernameKey adminContextKey = "admin_username"
	adminPasswordKey adminContextKey = "admin_password"
)

// Router returns a Gin engine with /api routes (login, refresh, logout).
func Router(cfg *env.Config, store *auth.TokenStore) (*gin.Engine, error) {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())

	api := r.Group("/api")
	{
		api.GET("/health", healthHandler())
		api.GET("/config", configHandler(cfg))
		api.GET("/session", sessionHandler(cfg, store))
		api.POST("/login", loginHandler(cfg, store))
		api.POST("/refresh", refreshHandler(cfg, store))
		api.POST("/logout", logoutHandler(cfg, store))

		admin := api.Group("/admin")
		admin.Use(adminAuthMiddleware(cfg))
		{
			admin.GET("/", adminStatusHandler(cfg))
			admin.GET("/users", adminListUsersHandler(cfg))
			admin.PUT("/users", adminPutUserHandler(cfg))
			admin.DELETE("/users/:id", adminDeleteUserHandler(cfg))
		}
	}
	return r, nil
}

func healthHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	}
}

func configHandler(cfg *env.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Sync is enabled if CouchDBProxiedURL is set and is a valid URL
		syncEnabled := false
		if cfg.CouchDBProxiedURL != "" {
			if _, err := url.Parse(cfg.CouchDBProxiedURL); err == nil {
				syncEnabled = true
			}
		}
		c.JSON(http.StatusOK, gin.H{
			"syncEnabled": syncEnabled,
		})
	}
}

type loginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func loginHandler(cfg *env.Config, store *auth.TokenStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req loginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "username and password required"})
			return
		}
		// Validate credentials against CouchDB _session so the same credentials work for DB access.
		if err := validateCouchDBCredentials(cfg, req.Username, req.Password); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}
		access, err := auth.MintAccessToken(req.Username, cfg.AuthTokenSecret, cfg.AuthTokenKid)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to mint token"})
			return
		}
		refresh, err := auth.MintRefreshToken(req.Username, cfg.AuthRefreshSecret, cfg.AuthTokenKid)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to mint refresh token"})
			return
		}
		hash := auth.TokenHash(refresh)
		expiresAt := time.Now().Add(auth.RefreshTokenDuration)
		if err := store.Store(hash, req.Username, expiresAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to store refresh token"})
			return
		}
		setAuthCookies(c, access, refresh)
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func refreshHandler(cfg *env.Config, store *auth.TokenStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		refresh, err := c.Cookie(auth.CookieRefreshToken)
		if err != nil || refresh == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing refresh token"})
			return
		}
		username, err := auth.ValidateRefreshToken(refresh, cfg.AuthRefreshSecret)
		if err != nil {
			clearAuthCookies(c)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token"})
			return
		}
		hash := auth.TokenHash(refresh)
		username, err = store.Consume(hash)
		if err != nil {
			clearAuthCookies(c)
			if errors.Is(err, auth.ErrTokenUsed) || errors.Is(err, auth.ErrTokenRevoked) {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "refresh token already used or revoked"})
				return
			}
			if errors.Is(err, auth.ErrTokenNotFound) || errors.Is(err, auth.ErrTokenExpired) {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired refresh token"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to validate refresh token"})
			return
		}
		access, err := auth.MintAccessToken(username, cfg.AuthTokenSecret, cfg.AuthTokenKid)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to mint token"})
			return
		}
		newRefresh, err := auth.MintRefreshToken(username, cfg.AuthRefreshSecret, cfg.AuthTokenKid)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to mint refresh token"})
			return
		}
		newHash := auth.TokenHash(newRefresh)
		expiresAt := time.Now().Add(auth.RefreshTokenDuration)
		if err := store.Store(newHash, username, expiresAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to store refresh token"})
			return
		}
		setAuthCookies(c, access, newRefresh)
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func sessionHandler(cfg *env.Config, store *auth.TokenStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Try to get access token first
		access, err := c.Cookie(auth.CookieAccessToken)
		if err == nil && access != "" {
			username, err := auth.ValidateAccessToken(access, cfg.AuthTokenSecret)
			if err == nil {
				// Access token is valid, refresh it and return user context
				newAccess, err := auth.MintAccessToken(username, cfg.AuthTokenSecret, cfg.AuthTokenKid)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to mint token"})
					return
				}
				refresh, _ := c.Cookie(auth.CookieRefreshToken)
				if refresh != "" {
					// Also refresh the refresh token
					newRefresh, err := auth.MintRefreshToken(username, cfg.AuthRefreshSecret, cfg.AuthTokenKid)
					if err == nil {
						newHash := auth.TokenHash(newRefresh)
						expiresAt := time.Now().Add(auth.RefreshTokenDuration)
						if err := store.Store(newHash, username, expiresAt); err == nil {
							setAuthCookies(c, newAccess, newRefresh)
						} else {
							// If store fails, keep old refresh token
							setAuthCookies(c, newAccess, refresh)
						}
					} else {
						// If mint fails, keep old refresh token
						setAuthCookies(c, newAccess, refresh)
					}
				} else {
					// No refresh token, just set new access token
					c.SetCookie(auth.CookieAccessToken, newAccess, 15*60, "/", "", false, true)
				}
				c.JSON(http.StatusOK, gin.H{"username": username})
				return
			}
		}

		// Access token invalid or missing, try refresh token
		refresh, err := c.Cookie(auth.CookieRefreshToken)
		if err != nil || refresh == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing or invalid token"})
			return
		}
		username, err := auth.ValidateRefreshToken(refresh, cfg.AuthRefreshSecret)
		if err != nil {
			clearAuthCookies(c)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token"})
			return
		}
		hash := auth.TokenHash(refresh)
		username, err = store.Consume(hash)
		if err != nil {
			clearAuthCookies(c)
			if errors.Is(err, auth.ErrTokenUsed) || errors.Is(err, auth.ErrTokenRevoked) {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "refresh token already used or revoked"})
				return
			}
			if errors.Is(err, auth.ErrTokenNotFound) || errors.Is(err, auth.ErrTokenExpired) {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired refresh token"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to validate refresh token"})
			return
		}
		// Mint new tokens
		newAccess, err := auth.MintAccessToken(username, cfg.AuthTokenSecret, cfg.AuthTokenKid)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to mint token"})
			return
		}
		newRefresh, err := auth.MintRefreshToken(username, cfg.AuthRefreshSecret, cfg.AuthTokenKid)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to mint refresh token"})
			return
		}
		newHash := auth.TokenHash(newRefresh)
		expiresAt := time.Now().Add(auth.RefreshTokenDuration)
		if err := store.Store(newHash, username, expiresAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to store refresh token"})
			return
		}
		setAuthCookies(c, newAccess, newRefresh)
		c.JSON(http.StatusOK, gin.H{"username": username})
	}
}

func logoutHandler(cfg *env.Config, store *auth.TokenStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		refresh, _ := c.Cookie(auth.CookieRefreshToken)
		if refresh != "" {
			hash := auth.TokenHash(refresh)
			_ = store.Revoke(hash)
		}
		clearAuthCookies(c)
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func setAuthCookies(c *gin.Context, access, refresh string) {
	maxAge := 7 * 24 * 3600                                                     // 7 days in seconds for refresh; access is short-lived
	c.SetCookie(auth.CookieAccessToken, access, 15*60, "/", "", false, true)    // 15 min, httpOnly
	c.SetCookie(auth.CookieRefreshToken, refresh, maxAge, "/", "", false, true) // 7 days, httpOnly
}

func clearAuthCookies(c *gin.Context) {
	c.SetCookie(auth.CookieAccessToken, "", -1, "/", "", false, true)
	c.SetCookie(auth.CookieRefreshToken, "", -1, "/", "", false, true)
}

// adminAuthMiddleware parses Basic auth and validates credentials against CouchDB; stores user/pass in context for downstream handlers.
func adminAuthMiddleware(cfg *env.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		const prefix = "Basic "
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, prefix) {
			c.Header("WWW-Authenticate", `Basic realm="admin"`)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing or invalid Authorization header; use Basic auth"})
			c.Abort()
			return
		}
		encoded := strings.TrimSpace(authHeader[len(prefix):])
		decoded, err := base64.StdEncoding.DecodeString(encoded)
		if err != nil {
			c.Header("WWW-Authenticate", `Basic realm="admin"`)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid Basic auth"})
			c.Abort()
			return
		}
		parts := strings.SplitN(string(decoded), ":", 2)
		if len(parts) != 2 || parts[0] == "" {
			c.Header("WWW-Authenticate", `Basic realm="admin"`)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid Basic auth"})
			c.Abort()
			return
		}
		username, password := parts[0], parts[1]
		if err := validateCouchDBCredentials(cfg, username, password); err != nil {
			c.Header("WWW-Authenticate", `Basic realm="admin"`)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid admin credentials"})
			c.Abort()
			return
		}
		c.Set(string(adminUsernameKey), username)
		c.Set(string(adminPasswordKey), password)
		c.Next()
	}
}

func getAdminCreds(c *gin.Context) (username, password string) {
	u, _ := c.Get(string(adminUsernameKey))
	p, _ := c.Get(string(adminPasswordKey))
	username, _ = u.(string)
	password, _ = p.(string)
	return username, password
}

// adminStatusHandler returns DB connection status: managed vs external, couch-per-user, etc.
func adminStatusHandler(cfg *env.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		username, password := getAdminCreds(c)
		managed, couchPerUser, err := adminDBStatus(cfg, username, password)
		if err != nil {
			if errors.Is(err, errUnauthorized) {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		resp := gin.H{
			"managed": managed,
		}
		if couchPerUser != nil {
			resp["couchPerUserEnabled"] = *couchPerUser
		}
		c.JSON(http.StatusOK, resp)
	}
}

// adminListUsersHandler lists users from _users.
func adminListUsersHandler(cfg *env.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		username, password := getAdminCreds(c)
		users, err := adminListUsers(cfg, username, password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, users)
	}
}

// putUserRequest is the same shape as the CouchDB _users document.
type putUserRequest struct {
	ID       string   `json:"_id,omitempty"`
	Rev      string   `json:"_rev,omitempty"`
	Name     string   `json:"name"`
	Type     string   `json:"type"`
	Roles    []string `json:"roles,omitempty"`
	Password string   `json:"password,omitempty"`
}

// adminPutUserHandler creates or updates a user.
func adminPutUserHandler(cfg *env.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		adminUser, adminPass := getAdminCreds(c)
		var req putUserRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
			return
		}
		if req.Name == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "name field required"})
			return
		}
		// Convert putUserRequest to couchDBUserDoc (same shape)
		doc := couchDBUserDoc{
			ID:       req.ID,
			Rev:      req.Rev,
			Name:     req.Name,
			Type:     req.Type,
			Roles:    req.Roles,
			Password: req.Password,
		}
		rev, created, err := adminPutUser(cfg, adminUser, adminPass, &doc)
		if err != nil {
			if errors.Is(err, errUnauthorized) {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
				return
			}
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if created {
			c.JSON(http.StatusCreated, gin.H{"ok": true, "rev": rev, "created": true})
		} else {
			c.JSON(http.StatusOK, gin.H{"ok": true, "rev": rev})
		}
	}
}

// adminDeleteUserHandler deletes a user.
func adminDeleteUserHandler(cfg *env.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		adminUser, adminPass := getAdminCreds(c)
		docID := c.Param("id")
		if docID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user _id required"})
			return
		}
		if err := adminDeleteUser(cfg, adminUser, adminPass, docID); err != nil {
			if strings.Contains(err.Error(), "not found") {
				c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}
