//go:build dev

package configs

// Paths for local development (built with: go build -tags dev ./cmd/papaya).
// This file is used when the "dev" build tag is specified; paths_default.go
// is used otherwise (e.g. Docker / production).
func init() {
	Paths = pathSet{
		ConfigDir:       "C:/Users/myname/projects/papaya", // TODO: adjust for your machine
		StaticAssetsDir: "C:/Users/myname/projects/papaya/app/dist",
	}
}
