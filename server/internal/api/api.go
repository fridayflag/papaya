package api

import (
	"errors"
	"net/http"
	"time"

	"github.com/fridayflag/papaya/internal/auth"
	"github.com/fridayflag/papaya/internal/env"
	"github.com/gin-gonic/gin"
)

// Router returns a Gin engine with /api routes (login, refresh, logout).
func Router(cfg *env.Config, store *auth.TokenStore) (*gin.Engine, error) {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())

	api := r.Group("/api")
	{
		api.GET("/health", healthHandler())
		api.POST("/login", loginHandler(cfg, store))
		api.POST("/refresh", refreshHandler(cfg, store))
		api.POST("/logout", logoutHandler(cfg, store))
	}
	return r, nil
}

func healthHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
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
	maxAge := 7 * 24 * 3600 // 7 days in seconds for refresh; access is short-lived
	c.SetCookie(auth.CookieAccessToken, access, 15*60, "/", "", false, true)   // 15 min, httpOnly
	c.SetCookie(auth.CookieRefreshToken, refresh, maxAge, "/", "", false, true) // 7 days, httpOnly
}

func clearAuthCookies(c *gin.Context) {
	c.SetCookie(auth.CookieAccessToken, "", -1, "/", "", false, true)
	c.SetCookie(auth.CookieRefreshToken, "", -1, "/", "", false, true)
}
