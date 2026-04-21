# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**zpotify** is a Spotify-like music streaming service with a Go backend and React/TypeScript frontend. The backend exposes both gRPC and REST (via grpc-gateway) APIs, backed by PostgreSQL, with Telegram bot integration.

## Common Commands

### Backend (Go)
```bash
go build -v ./...          # Build all packages
go test ./...              # Run all tests
golangci-lint run ./...    # Lint (uses .golangci.yaml)
go mod tidy                # Tidy dependencies
```

### Code Generation
```bash
make codegen               # Run all code generation (protos + sqlc)
make gen                   # Generate gRPC server code from protos (runs moti g)
make warmup                # Prepare and install proto dependencies
make install-go-deps       # Install sqlc and other codegen tools
```

### Frontend
```bash
cd pkg/web/ZpotifyUI
npm run dev                # Vite dev server
npm run build:ui           # TypeScript check + Vite build
npm run lint               # ESLint
make build-ui              # Full build: npm link + dist copy to backend
```

### Docker / Local Dev
```bash
docker compose up          # Start PostgreSQL (port 15432) + proxy (port 8085)
make build-local-container # Build Docker image locally
```

## Architecture

### Request Flow
```
Client → gRPC or HTTP/REST (:80)
  → internal/transport/*_api_impl (gRPC handlers)
  → internal/service/v1/ (business logic)
  → internal/storage/pg/ (SQLC queries against PostgreSQL)
```

REST is provided by **grpc-gateway** mounted at `/api`. The frontend is served by the Go backend from `internal/transport/web/`.

### Key Layers

**`internal/app/`** — App wiring: initializes config, database, gRPC/HTTP listeners, services, and background workers.

**`internal/service/v1/`** — Business logic services: `AudioService`, `UserService`, `AuthService`, `PlaylistService`, `ArtistsService`, `FileService`. Service interfaces are in `internal/service/service.go`.

**`internal/transport/`** — gRPC handler implementations (one subdirectory per service group). Also contains `wapi/` for any direct HTTP handlers and `web/` for the embedded React frontend.

**`internal/storage/`** — Database access. SQLC-generated code lives in `internal/storage/pg/`. File storage abstraction is in `internal/storage/file_storage_providers/`.

**`internal/middleware/`** — gRPC interceptors (auth, user context injection).

**`api/grpc/`** — Proto source files. Generated Go code goes to `internal/api/server/zpotify_api/`. Swagger docs go to `pkg/docs/swaggers/`.

**`migrations/`** — Goose migration files. Applied on startup via the configured migrations folder.

### Code Generation

Proto generation is configured in **`moti.yaml`** and run via `make gen`. This produces:
- `*.pb.go` — protobuf message types
- `*_grpc.pb.go` — gRPC service stubs
- `*.pb.gw.go` — grpc-gateway REST bridge
- `*.swagger.json` — OpenAPI v2 docs

SQL queries are in `internal/storage/pg/queries/*.sql`; SQLC regenerates Go from these.

**Never hand-edit generated files** (`*.pb.go`, `*.pb.gw.go`, `*_grpc.pb.go`, SQLC output). Regenerate instead.

### Configuration

Runtime config is YAML-based (matreshka framework). Dev config: `config/dev.yaml`. Key settings:
- Server port: 80 (gRPC + HTTP gateway)
- PostgreSQL: `localhost:15432`, user `zpotify`, db `zpotify_db` (local Docker)
- Local file storage path: `/data`
- `debug_auth` flag to bypass auth in development

### Frontend

React 18 + TypeScript, built with Vite. State: Zustand. Backend calls via **gRPC-web**. After `npm run build:ui`, the built `dist/` is copied into the Go backend for serving.

Frontend source: `pkg/web/ZpotifyUI/src/`. API client processes live in `src/processes/`.

## Go Coding Rules

- **Always use `utils.CloseWithLog(c, "subject")` for deferred closes** instead of inline `defer c.Close()` or manual close-with-error-log patterns. The function is at `internal/utils/closer.go` (`go.zpotify.ru/zpotify/internal/utils`).