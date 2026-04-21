# Architecture

## What the App Does

zpotify is a Spotify-like music streaming service. It exposes a gRPC + REST API (via grpc-gateway), stores metadata in PostgreSQL, and streams audio files from local disk. A React/TypeScript frontend is embedded in and served by the Go binary.

## Component Map

```
cmd/service/main.go
    └── internal/app/
            ├── app.go          — App struct, listeners, DB connection, config
            ├── custom.go       — Wires services, middleware, handlers, bg workers
            ├── config.go       — Config loading (matreshka YAML)
            ├── data_sources.go — PostgreSQL + Telegram init
            └── server.go       — gRPC/HTTP server setup
```

### Request Flow

```
Client (gRPC or HTTP :8087)
  │
  ├── gRPC interceptors: auth → log → panic recovery
  │
  ├── internal/transport/*_api_impl/   gRPC handler impls
  │       auth_api_impl/
  │       user_api_impl/
  │       song_api_impl/
  │       playlist_api_impl/
  │       artists_api_impl/
  │       file_api_impl/
  │
  ├── internal/service/v1/             Business logic
  │
  └── internal/storage/pg/            SQLC queries → PostgreSQL
```

Direct HTTP handlers (outside grpc-gateway) in `internal/transport/wapi/`:
- `GET  /wapi/audio` — byte-range audio streaming
- `POST /wapi/files/upload` — multipart file upload

Static frontend served from `internal/transport/web/` (embedded via `make build-ui`).

### Storage

| Layer | Tech | Details |
|---|---|---|
| Metadata | PostgreSQL | sessions, users, songs, playlists, permissions |
| Audio files | Local filesystem | temp: `{root}/tmp/{userId}/{file}` → perm: `{root}/{artistUuid}/{songId}.{ext}` |

### Background Jobs

`internal/background/sessions_gc/` — periodically deletes expired user sessions.

## Key Design Decisions

**Proto-first.** All service contracts live in `api/grpc/*.proto`. grpc-gateway generates the REST bridge. Never edit `*.pb.go`, `*.pb.gw.go`, `*_grpc.pb.go`, or SQLC output — regenerate with `make codegen`.

**Token-based auth.** UUID access tokens (1 h TTL) + refresh tokens (7 d TTL) in `user_sessions`. The auth gRPC interceptor validates every call and injects the user into context.

**Per-user permissions.** `user_permissions` table gates uploads, early access, and playlist creation independently.

**Debug auth.** `debug_auth: true` in config lets `Z-Tg-Id` / `Z-Tg-Username` headers bypass token validation — dev only.

**Goose migrations.** Applied automatically on startup from `migrations/` via `migrations_folder` in config.

**Embedded frontend.** `make build-ui` copies the Vite dist into `internal/transport/web/` so one binary serves everything.
