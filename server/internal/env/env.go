package env

import (
	"fmt"
	"os"
	"strconv"
)

// Config holds server configuration loaded from the environment at startup.
// See .env.example for variable names and purposes.
type Config struct {
	ServerPort        int
	AuthTokenSecret   string
	AuthRefreshSecret string
	CouchDBAdminUser  string
	CouchDBAdminPass  string
	CouchDBHost       string
	CouchDBPort       int
}

// CouchDBProxiedURL returns the URL to which /db/* requests are proxied.
// Uses COUCH_DB_PROXIED_URL if set; otherwise builds from COUCHDB_* variables.
func (c *Config) CouchDBProxiedURL() string {
	if u := os.Getenv("COUCH_DB_PROXIED_URL"); u != "" {
		return u
	}
	return fmt.Sprintf("http://%s:%s@%s:%d",
		c.CouchDBAdminUser, c.CouchDBAdminPass, c.CouchDBHost, c.CouchDBPort)
}

// CouchDBBaseURL returns the CouchDB origin without credentials (e.g. for _session).
func (c *Config) CouchDBBaseURL() string {
	return fmt.Sprintf("http://%s:%d", c.CouchDBHost, c.CouchDBPort)
}

// Load reads configuration from the environment.
func Load() (*Config, error) {
	port, err := intEnv("SERVER_PORT", 1234)
	if err != nil {
		return nil, err
	}
	couchPort, err := intEnv("COUCHDB_PORT", 5984)
	if err != nil {
		return nil, err
	}
	return &Config{
		ServerPort:        port,
		AuthTokenSecret:   getEnv("AUTH_TOKEN_SECRET", ""),
		AuthRefreshSecret: getEnv("AUTH_REFRESH_TOKEN", ""),
		CouchDBAdminUser:  getEnv("COUCHDB_ADMIN_USER", "papaya"),
		CouchDBAdminPass:  getEnv("COUCHDB_ADMIN_PASS", "admin"),
		CouchDBHost:       getEnv("COUCHDB_HOST", "localhost"),
		CouchDBPort:       couchPort,
	}, nil
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func intEnv(key string, def int) (int, error) {
	s := os.Getenv(key)
	if s == "" {
		return def, nil
	}
	v, err := strconv.Atoi(s)
	if err != nil {
		return 0, fmt.Errorf("%s: invalid integer: %w", key, err)
	}
	return v, nil
}
