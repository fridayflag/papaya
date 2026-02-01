package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const (
	accessTokenDuration  = 15 * time.Minute
	refreshTokenDuration = 7 * 24 * time.Hour
)

// AccessClaims holds JWT claims for the access token.
type AccessClaims struct {
	jwt.RegisteredClaims
}

// RefreshClaims holds JWT claims for the refresh token.
type RefreshClaims struct {
	jwt.RegisteredClaims
}

// MintAccessToken creates a new JWT access token for the given username.
// If kid is non-empty, it is set as the JWT "kid" header (key ID).
func MintAccessToken(username, secret, kid string) (string, error) {
	claims := AccessClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   username,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(accessTokenDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	if kid != "" {
		t.Header["kid"] = kid
	}
	return t.SignedString([]byte(secret))
}

// MintRefreshToken creates a new refresh token for the given username.
// If kid is non-empty, it is set as the JWT "kid" header (key ID).
func MintRefreshToken(username, secret, kid string) (string, error) {
	claims := RefreshClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   username,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(refreshTokenDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	if kid != "" {
		t.Header["kid"] = kid
	}
	return t.SignedString([]byte(secret))
}

// ValidateAccessToken parses and validates the access token; returns the username.
func ValidateAccessToken(tokenStr, secret string) (username string, err error) {
	t, err := jwt.ParseWithClaims(tokenStr, &AccessClaims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return "", err
	}
	claims, ok := t.Claims.(*AccessClaims)
	if !ok || !t.Valid {
		return "", errors.New("invalid access token")
	}
	return claims.Subject, nil
}

// ValidateRefreshToken parses and validates the refresh token; returns the username.
func ValidateRefreshToken(tokenStr, secret string) (username string, err error) {
	t, err := jwt.ParseWithClaims(tokenStr, &RefreshClaims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return "", err
	}
	claims, ok := t.Claims.(*RefreshClaims)
	if !ok || !t.Valid {
		return "", errors.New("invalid refresh token")
	}
	return claims.Subject, nil
}
