package env

import (
	"fmt"
	"os"
	"strconv"
)

// Config holds server configuration loaded from the environment at startup.
// All values are read once; changing env vars requires a server restart.
// See .env.example for variable names and purposes.
type Config struct {
	ServerPort         int
	AuthTokenSecret    string
	AuthRefreshSecret  string
	AuthTokenKid       string
	CouchDBHost        string
	CouchDBPort        int
	CouchDBProxiedURL  string // URL for /db/* proxy; from COUCH_DB_PROXIED_URL or built from host:port
	StaticAssetsDir    string
	ConfigDir          string
}

// CouchDBBaseURL returns the CouchDB origin without credentials (e.g. for _session).
func (c *Config) CouchDBBaseURL() string {
	return fmt.Sprintf("http://%s:%d", c.CouchDBHost, c.CouchDBPort)
}

// Load reads configuration from the environment once at startup.
func Load() (*Config, error) {
	port, err := intEnv("SERVER_PORT", 1234)
	if err != nil {
		return nil, err
	}
	couchPort, err := intEnv("COUCHDB_PORT", 5984)
	if err != nil {
		return nil, err
	}
	couchHost := getEnv("COUCHDB_HOST", "localhost")
	proxiedURL := getEnv("COUCH_DB_PROXIED_URL", "")
	if proxiedURL == "" {
		proxiedURL = fmt.Sprintf("http://%s:%d", couchHost, couchPort)
	}
	return &Config{
		ServerPort:        port,
		AuthTokenSecret:   getEnv("AUTH_TOKEN_SECRET", ""),
		AuthRefreshSecret: getEnv("AUTH_REFRESH_SECRET", ""),
		AuthTokenKid:      getEnv("AUTH_TOKEN_KID", ""),
		CouchDBHost:       couchHost,
		CouchDBPort:       couchPort,
		CouchDBProxiedURL: proxiedURL,
		StaticAssetsDir:   getEnv("STATIC_ASSETS_DIR", "/var/www/papaya"),
		ConfigDir:         getEnv("CONFIG_DIR", "/opt/papaya"),
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
