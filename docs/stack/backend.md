# Stack — backend

## Language & runtime

- **Go 1.24.2** — module: `go.zpotify.ru/zpotify`

---

## Key dependencies

| Purpose | Library |
|---|---|
| gRPC server | `google.golang.org/grpc` v1.73.0 |
| REST bridge | `grpc-ecosystem/grpc-gateway/v2` v2.27.1 |
| Configuration | `go.vervstack.ru/matreshka` v1.0.95 |
| Error wrapping | `go.redsock.ru/rerrors` (carries gRPC status codes) |
| PostgreSQL driver | `github.com/lib/pq` v1.10.9 |
| Migrations | `github.com/pressly/goose/v3` v3.24.3 |
| Query builder | `github.com/Masterminds/squirrel` v1.5.4 |
| In-memory cache | `github.com/dgraph-io/ristretto/v2` v2.3.0 |
| Logging | `github.com/rs/zerolog` v1.34.0 |
| gRPC+HTTP mux | `github.com/soheilhy/cmux` v0.1.5 |
| Telegram bot | `github.com/Red-Sock/go_tg` v0.0.26 |

---

## Code conventions

- **Deferred closes:** always `utils.CloseWithLog(c, "label")`, never `defer c.Close()`
- **No inline struct literals in calls:** assign to a variable first, then pass
- **Errors:** use `rerrors.Wrap(err)` to preserve gRPC status codes up the stack
- **Error vars by layer:** `storage/errors.go` → `ErrNotFound`, `ErrAlreadyExists`; `service/service_errors/` → `ErrUnauthenticated`, `ErrUnauthorized`
- **Transactions:** storages implement `WithTx(tx)` returning a scoped copy; `TxManager` orchestrates
- **Naming:** packages lowercase single word; handler methods match proto RPC names exactly; error vars prefixed `Err`
- **Never hand-edit** `internal/storage/pg/` or `internal/api/server/zpotify_api/`

---

## Infrastructure

| Tool | Purpose |
|---|---|
| PostgreSQL 17 | Primary database |
| nginx alpine | Reverse proxy + audio file server (port 8085) |
| Docker Compose | Local dev orchestration |
| sqlc | SQL → Go codegen |
| moti | Proto → Go/TS codegen |
| golangci-lint | Linting |
