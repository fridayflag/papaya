package configs

// Paths holds compile-time constants for host paths used at runtime.
// This is the default build (no build tag); see paths_dev.go for the dev build.
var Paths = pathSet{
	// ConfigDir is the path on the host to the directory containing config.yaml
	// (e.g. "/opt/papaya"). Used for reading app configuration at startup.
	ConfigDir: "/opt/papaya",
	// StaticAssetsDir is the path on the host to the web app static assets
	// (e.g. "/var/www/papaya"). Served by the file server at startup.
	StaticAssetsDir: "/var/www/papaya",
}

type pathSet struct {
	ConfigDir       string
	StaticAssetsDir string
}
