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
moti g # generate contracts
rscli-dev project tidy # generate configs
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

SQL queries are in `internal/storage/pg/queries/*.sql`; SQLC regenerates Go from these. Each domain area gets its own subdirectory and `sqlc.yaml` entry (e.g. `queries/garbage_collector/` → package `garbage_collector_q`).

**Never hand-edit generated files** (`*.pb.go`, `*.pb.gw.go`, `*_grpc.pb.go`, SQLC output). Regenerate instead.

### SQL Query Rules

- **Always use SQLC for simple queries** — fixed SELECT/INSERT/UPDATE/DELETE with no optional clauses. Write the SQL in `internal/storage/pg/queries/<domain>/<domain>.sql`, add a `sqlc.yaml` section, run `sqlc generate`, and use the generated querier in the storage struct. Never write raw `db.QueryContext` / `db.ExecContext` calls for simple queries.
- **Use versioned DB views for multi-table reads** — when a query JOINs multiple tables, create a view migration named `<name>_v1` (e.g. `song_base_view_v1`) and query the view via SQLC. Bump the version number (`_v2`, `_v3`, …) instead of altering the existing view, so existing queries remain stable.
- **Use `github.com/Masterminds/squirrel` for complex queries with optional fields** — when clauses are built dynamically (optional filters, variable ORDER BY, pagination with optional limits), use squirrel's builder with `.PlaceholderFormat(sq.Dollar)` and pass the resulting SQL + args to `db.QueryContext`. Never hand-concatenate SQL strings with optional fragments.

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
- **Never create struct/value literals inline in a function call.** Always assign to a named variable first, then pass the variable. Example — wrong: `foo(Bar{X: 1})`; correct: `bar := Bar{X: 1}; foo(bar)`.
- **NEVER check function errors inline:** use `if err := func(); err != nil` — always split into a separate assignment (`err := func()`) followed by `if err != nil` on the next line.
- **Never return an error unwrapped** — always wrap with `rerrors.Wrap(err)` or `rerrors.Wrap(err, "context message")`. This applies everywhere: transaction callbacks, helper functions, and public methods alike.
- **Never call one public method from another on the same struct** — if two public methods share logic, extract a private helper and call it from both independently.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
