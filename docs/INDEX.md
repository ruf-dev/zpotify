# zpotify — knowledge index

zpotify is an open-source Spotify alternative: a Go backend serving gRPC + REST, a React/TypeScript frontend embedded in the binary, PostgreSQL for storage, and nginx for audio streaming.

---

## How to use this vault

| Question type | Go to |
|---|---|
| "How does X flow / where does Y live / system design" | `architecture/` |
| "What do we use for X / tech versions / dependencies" | `stack/` |
| "Add / update / check tasks and features" | `roadmap/` |
| "Show / save a UI component" | `ui/` |

---

## Folder map

- [[architecture/overview]] — high-level system diagram, folder structure, request lifecycle
- [[architecture/api]] — gRPC services, REST endpoints, proto contracts, auth flow
- [[architecture/database]] — schema tables, key relationships, migration conventions
- [[stack/backend]] — Go libs, versions, key patterns and conventions
- [[stack/frontend]] — React/TS libs, build pipeline, state management, styling rules
- [[roadmap/backlog]] — features and fixes not yet started
- [[roadmap/in-progress]] — what's actively being worked on
- [[ui/components]] — saved Claude-generated UI components

---

## Key concepts

- **Transport layer** — gRPC handlers in `internal/transport/*_api_impl/`, REST exposed via grpc-gateway at `/api`
- **Service layer** — business logic in `internal/service/v1/`, accessed only through the `Service` interface
- **Storage layer** — SQLC-generated queries in `internal/storage/pg/`, never hand-edited
- **Binary embedding** — React frontend is built and embedded into the Go binary, served at `/`
- **Audio serving** — nginx serves audio files directly from disk with byte-range support; Go only handles metadata
- **Permissions** — per-user flags: `can_upload`, `can_create_playlist`, `early_access`
- **Auth** — token-based (access + refresh pair); Telegram async flow also supported

---

## Request flow (brief)

```
Client → nginx:8085 (audio) or Go:8087 (API + SPA)
       → transport/*_api_impl (gRPC handlers)
       → service/v1 (business logic)
       → storage/pg (PostgreSQL via SQLC)
```

---

## Roadmap snapshot

See [[roadmap/backlog]] and [[roadmap/in-progress]] for current state.

---

## Recent UI components

See [[ui/components]] for saved component catalogue.
