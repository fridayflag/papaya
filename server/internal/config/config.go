package config

// TODO: Implement reading config.yaml from configDir at startup.
// The file lets users configure the app. Do not implement reading this file here; stub the method(s)
// that the server will call at startup so that the integration point is clear.

// Load reads the app configuration from disk (e.g. config.yaml in configDir).
// configDir is set from env CONFIG_DIR at runtime.
// Returns (nil, nil) until implemented.
func Load(configDir string) (*AppConfig, error) {
	_ = configDir
	return nil, nil
}

// AppConfig is the in-memory representation of the app config file (not implemented yet).
type AppConfig struct{}
