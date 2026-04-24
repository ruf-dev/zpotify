# Agent Context Pack

Pre-assembled context for coder agents. Inject the relevant section into every agent prompt so the agent never needs to explore the codebase to understand conventions.

---

## Backend agent context

### Request flow
```
Client → transport/*_api_impl (gRPC handler)
       → service/v1/ (business logic)
       → storage/pg/ (SQLC queries → PostgreSQL)
```

### New endpoint — full checklist
1. Add RPC + message types to `.proto` in `api/grpc/`
2. `make gen` → regenerates `*.pb.go`, `*_grpc.pb.go`, `*.pb.gw.go`
3. Add method signature to `Service` interface (`internal/service/service.go`)
4. Implement in `internal/service/v1/` — business logic only, no DB calls
5. Add SQL to `internal/storage/pg/queries/*.sql`
6. `make codegen` → regenerates SQLC Go code
7. Implement storage method (SQLC-backed)
8. Implement gRPC handler in `internal/transport/*_api_impl/`

### Hard rules
- **SQLC only** — never write raw query strings in Go code
- **Never hand-edit** `internal/storage/pg/` or `internal/api/server/zpotify_api/`
- **Deferred closes:** `utils.CloseWithLog(c, "label")` — never `defer c.Close()`
- **No inline struct literals** in function calls — assign to variable first
- **Errors:** `rerrors.Wrap(err)` at storage layer; use `service_errors/` vars at service layer
- **Transactions:** use `TxManager`; storages expose `WithTx(tx)` for scoped copy
- **Naming:** handler methods must match proto RPC names exactly

### Error variables by layer
- `internal/storage/errors.go` → `ErrNotFound`, `ErrAlreadyExists`
- `internal/service/service_errors/` → `ErrUnauthenticated`, `ErrUnauthorized`

---

## Frontend agent context

### Layer hierarchy (higher = more composite, cannot import from below)
```
dialogs / pages  →  widgets  →  components  →  processes / hooks / model  →  app
```

### New feature — full checklist
1. Add process in `src/processes/` — gRPC-web call only, no UI logic
2. Add Zustand store or hook if shared state is needed
3. Build widget in `src/widgets/` — business logic + component composition
4. Wire into `src/pages/` or `src/dialogs/`

### Hard rules
- **gRPC calls only in `src/processes/`** — never call API from component or widget directly
- **CSS Modules only** — no inline styles, no styled-components
- **No hardcoded colors or px** — always use CSS variables from `colors_and_type.css` and `sizes.css`
- **Named functions** — components are `function Name()`, never `const Name = () =>`
- **One file, one component**
- **Dialogs** — use `useDialog` hook from `@/app/hooks/Dialog.tsx` only
- **Animations** — CSS first; `framer-motion` only if CSS cannot achieve the effect
- **State** — Zustand for new code; hookstate is legacy, do not add new hookstate usage
- **Imports** — always use `@/` alias, never relative paths climbing above `src/`

### CSS class naming
- Root style: `*Container`
- Wrapper around composed children: `*Wrapper`
- Use CSS nesting for child selectors inside a module

---

## QA agent context

Given: task brief + git diff

Produce:
1. Unit or integration tests covering the acceptance criteria
2. A short checklist of convention violations to flag, checked against:
   - SQLC-only queries (no raw strings)
   - No hand-edited generated files
   - Correct error variable usage by layer
   - CSS variable usage (no hardcoded hex/px)
   - No direct gRPC calls from components/widgets
3. `go build ./...` or `npm run build:ui` must pass before marking done

---

## Docs agent context

Given: task brief + git diff

Update the vault:
- Move task from `roadmap/in-progress.md` to done (delete the entry) when shipped
- Update `architecture/` notes if new endpoints, tables, or layers were added
- Update `stack/` notes if new dependencies were introduced
- Keep entries short — one paragraph max per change
