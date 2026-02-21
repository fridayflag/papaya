# Papaya server

Go server for Papaya: static SPA hosting, CouchDB proxy, and JWT auth API.

## Build and run

From the repo root (or with `GOPATH`/module-aware build from `server/`):

```bash
cd server
go build -o bin/papaya ./cmd/papaya
./bin/papaya
```

Copy `.env.example` to `.env` in the project root and set variables (see root `.env.example`). Paths like `PAPAYA_STATIC_ASSETS_DIR` and `PAPAYA_CONFIG_DIR` are runtime; set them for local dev (e.g. `PAPAYA_STATIC_ASSETS_DIR=./app/dist`, `PAPAYA_CONFIG_DIR=./`) or leave defaults for Docker.

## Layout

- **cmd/papaya** – main binary
- **internal/api** – Gin routes: `/api/login`, `/api/refresh`, `/api/logout`
- **internal/auth** – JWT minting/validation and cookie names
- **internal/config** – stub for reading `config.yaml` at startup (TODO)
- **internal/env** – env-based config
- **internal/proxy** – reverse proxy for `/db/*` → CouchDB
- **internal/static** – SPA file server (index.html catch-all)

## API

- **POST /api/login** – body `{"username","password"}`; validates against CouchDB `/_session`, sets JWT and refresh cookies.
- **POST /api/refresh** – uses refresh cookie; issues new access (and refresh) tokens.
- **POST /api/logout** – clears auth cookies.

Tokens are stored in httpOnly cookies (`papaya_token`, `papaya_refresh`).
