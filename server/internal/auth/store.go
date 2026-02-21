package auth

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"os"
	"path/filepath"
	"time"

	_ "modernc.org/sqlite"
)

const schema = `
CREATE TABLE IF NOT EXISTS refresh_tokens (
  token_hash TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  revoked_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_username ON refresh_tokens(username);
`

// TokenStore persists refresh tokens in SQLite for one-time use and revocation.
type TokenStore struct {
	db *sql.DB
}

// Open opens the SQLite database at dbPath, runs migrations, and returns a TokenStore.
// Creates the parent directory of dbPath if it does not exist (e.g. so /etc/papaya/papaya.db works in Docker).
func Open(dbPath string) (*TokenStore, error) {
	dir := filepath.Dir(dbPath)
	if dir != "." {
		if err := os.MkdirAll(dir, 0750); err != nil {
			return nil, err
		}
	}
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, err
	}
	if _, err := db.Exec(schema); err != nil {
		_ = db.Close()
		return nil, err
	}
	return &TokenStore{db: db}, nil
}

// Close closes the database connection.
func (s *TokenStore) Close() error {
	return s.db.Close()
}

// TokenHash returns the SHA256 hex-encoded hash of the token string (for storage/lookup).
func TokenHash(token string) string {
	h := sha256.Sum256([]byte(token))
	return hex.EncodeToString(h[:])
}

// Store records a refresh token for the user. Call with the hash from TokenHash(token).
func (s *TokenStore) Store(tokenHash, username string, expiresAt time.Time) error {
	_, err := s.db.Exec(
		`INSERT INTO refresh_tokens (token_hash, username, expires_at, used_at, revoked_at) VALUES (?, ?, ?, NULL, NULL)`,
		tokenHash, username, expiresAt.Unix(),
	)
	return err
}

var (
	ErrTokenNotFound = errors.New("token not found")
	ErrTokenUsed     = errors.New("token already used")
	ErrTokenRevoked  = errors.New("token revoked")
	ErrTokenExpired  = errors.New("token expired")
)

// Consume validates the refresh token (exists, not used, not revoked, not expired)
// and atomically marks it as used. Returns the username on success.
func (s *TokenStore) Consume(tokenHash string) (username string, err error) {
	now := time.Now().Unix()
	tx, err := s.db.Begin()
	if err != nil {
		return "", err
	}
	defer tx.Rollback()

	var usedAt, revokedAt sql.NullInt64
	var expAt int64
	err = tx.QueryRow(
		`SELECT username, expires_at, used_at, revoked_at FROM refresh_tokens WHERE token_hash = ?`,
		tokenHash,
	).Scan(&username, &expAt, &usedAt, &revokedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", ErrTokenNotFound
		}
		return "", err
	}
	if expAt <= now {
		return "", ErrTokenExpired
	}
	if usedAt.Valid {
		return "", ErrTokenUsed
	}
	if revokedAt.Valid {
		return "", ErrTokenRevoked
	}

	_, err = tx.Exec(
		`UPDATE refresh_tokens SET used_at = ? WHERE token_hash = ?`,
		now, tokenHash,
	)
	if err != nil {
		return "", err
	}
	if err := tx.Commit(); err != nil {
		return "", err
	}
	return username, nil
}

// Revoke marks the given token (by hash) as revoked (e.g. on logout).
func (s *TokenStore) Revoke(tokenHash string) error {
	now := time.Now().Unix()
	_, err := s.db.Exec(
		`UPDATE refresh_tokens SET revoked_at = ? WHERE token_hash = ?`,
		now, tokenHash,
	)
	return err
}

// RevokeAllForUser revokes all refresh tokens for the given user (e.g. logout all devices).
func (s *TokenStore) RevokeAllForUser(username string) error {
	now := time.Now().Unix()
	_, err := s.db.Exec(
		`UPDATE refresh_tokens SET revoked_at = ? WHERE username = ? AND revoked_at IS NULL`,
		now, username,
	)
	return err
}
