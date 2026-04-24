# Architecture — overview

## What zpotify is

A self-hosted music streaming service. Users upload audio files, organise them into playlists, and stream them from a web UI or via API.

---

## Folder structure (top level)

```
zpotify/
├── cmd/service/        # entry point
├── internal/
│   ├── app/            # wiring: config, DB, server, services, workers
│   ├── service/v1/     # business logic
│   ├── transport/      # gRPC handlers + HTTP wiring
│   ├── storage/pg/     # SQLC-generated data access (never hand-edit)
│   ├── middleware/     # auth, logging, panic recovery interceptors
│   ├── domain/         # domain models
│   └── background/     # background workers (session GC)
├── api/grpc/           # .proto source files
├── pkg/web/ZpotifyUI/  # React frontend (Vite + TypeScript)
├── migrations/         # Goose SQL migrations
└── config/             # dev.yaml, config.yaml
```

---

## Request lifecycle

```
Client
  → nginx:8085       audio files (byte-range streaming, CORS)
  → Go:8087          gRPC native  /
                     REST/HTTP    /api/*   (grpc-gateway)
                     React SPA    /*       (embedded dist)
  → transport layer  gRPC handlers per service
  → service/v1       business logic
  → storage/pg       PostgreSQL via SQLC
```

**Key point:** nginx owns audio delivery. Go owns everything else — API, auth, metadata, and serving the frontend.

---

## Domain entities

- **User** — identified by username; has permissions and settings
- **Song** — has a title, one or more artists, and a linked file
- **File** — physical audio file on disk; metadata stored in DB (path, duration, size, verified flag)
- **Artist** — name + UUID; many-to-many with songs
- **Playlist** — ordered list of songs; has owner, visibility (public/private), and per-user permissions

---

## Background jobs

- **Session GC** — periodically deletes expired access/refresh token pairs
