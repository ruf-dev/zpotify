# Task Brief Template

Use this template when creating a task for a coder agent.
The Task Architect (Claude Sonnet + vault context) fills this out before any coder agent is spawned.

---

## Task: [name]

**Area:** backend | frontend | both
**Priority:** high | medium | low
**Goal:** One sentence — what does this ship and why does it matter?

---

## Scope

**Files to touch:**
- (explicit list — backend agent reads max 3 files per CLAUDE.md rule)

**Do NOT touch:**
- `internal/storage/pg/` — SQLC generated, never hand-edit
- `internal/api/server/zpotify_api/` — proto generated, never hand-edit
- Any file not listed above

---

## Implementation steps

> Be explicit. The coder agent does not explore — it executes.

1. ...
2. ...
3. ...

For backend tasks involving a new endpoint, follow this checklist:
- [ ] Add RPC to `.proto` file in `api/grpc/`
- [ ] Run `make gen` to regenerate gRPC + gateway code
- [ ] Add method to `Service` interface in `internal/service/service.go`
- [ ] Implement in `internal/service/v1/`
- [ ] Add SQL query to `internal/storage/pg/queries/*.sql`
- [ ] Run `make codegen` to regenerate SQLC
- [ ] Implement storage method
- [ ] Implement gRPC handler in `internal/transport/*_api_impl/`

For frontend tasks involving a new feature, follow this checklist:
- [ ] Add process class in `src/processes/` (gRPC call only here)
- [ ] Add hook or Zustand store if state is needed
- [ ] Build widget in `src/widgets/` (business logic + composition)
- [ ] Wire into page or dialog

---

## Patterns to follow

> Reference the specific convention from CLAUDE.md or stack notes.

- e.g. "use `utils.CloseWithLog`, never `defer c.Close()`"
- e.g. "new sqlc query: add to `.sql` file, run `make codegen`, never write raw query string"
- e.g. "CSS Modules only, all colors from `colors_and_type.css` variables"

---

## Acceptance criteria

- [ ] ...
- [ ] Builds without error (`go build ./...` or `npm run build:ui`)
- [ ] No hand-edited generated files
- [ ] Follows conventions in CLAUDE.md

---

## Context files to inject

> Paste these paths into the agent's context before starting.

- `CLAUDE.md` (root or frontend)
- (relevant architecture file from vault if needed)
- (specific source files listed above)
