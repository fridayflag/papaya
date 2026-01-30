package config

// TODO: Implement reading config.yaml from the path provided by configs.Paths.ConfigDir at startup.
// The file lets users configure the app. Do not implement reading this file here; stub the method(s)
// that the server will call at startup so that the integration point is clear.

// Load reads the app configuration from disk (e.g. config.yaml in ConfigDir).
// Returns (nil, nil) until implemented.
func Load() (*AppConfig, error) {
	return nil, nil
}

// AppConfig is the in-memory representation of the app config file (not implemented yet).
type AppConfig struct{}
