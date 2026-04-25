# Task Brief — M0-1 · Web upload flow (backend)

**Area:** backend
**Priority:** high
**Goal:** Expose an HTTP endpoint that accepts an audio file upload, validates it, persists it to disk, creates a `files_meta` row, and returns the file ID — gated on `can_upload` permission.

---

## Scope

**Files to touch:**
- `internal/transport/wapi/` — add new HTTP handler file, e.g. `upload_handler.go`
- `internal/transport/wapi/router.go` (or equivalent mux registration file) — register the new route
- `internal/service/service.go` — add `UploadFile` to the `Service` interface
- `internal/service/v1/upload.go` (new file) — implement service method
- `internal/storage/pg/queries/files_meta.sql` — add INSERT query
- Run `make codegen` after editing the SQL file

**Do NOT touch:**
- `internal/storage/pg/` — SQLC generated, never hand-edit
- `internal/api/server/zpotify_api/` — proto generated, never hand-edit
- Any file not listed above

---

## Implementation steps

1. **Add SQLC query** — in `internal/storage/pg/queries/files_meta.sql`, add an `InsertFileMeta` query that inserts `path`, `duration`, `size`, `uploaded_by` (user INT8), `verified` (default false), and returns the new row's `id`. Run `make codegen` immediately after.

2. **Add `UploadFile` to the Service interface** — in `internal/service/service.go`, add:
   ```go
   UploadFile(ctx context.Context, req UploadFileRequest) (int64, error)
   ```
   where `UploadFileRequest` is a named struct (assigned to variable before use) containing `UserID int64`, `Filename string`, `MimeType string`, `Size int64`, `Reader io.Reader`.

3. **Implement service method** — create `internal/service/v1/upload.go`:
   - Check caller has `can_upload` permission; return `service_errors.ErrUnauthorized` if not
   - Validate MIME type is one of `audio/mpeg`, `audio/flac`, `audio/ogg`, `audio/wav`
   - Validate size ≤ configured max (read from config; default 500MB)
   - Write file to disk under the configured audio directory using a generated unique filename (UUID-based)
   - Call storage `InsertFileMeta` with path, size, uploaded_by; wrap any error with `rerrors.Wrap(err)`
   - Return the new file ID

4. **Implement HTTP handler** — create `internal/transport/wapi/upload_handler.go`:
   - `multipart/form-data` POST, field name `file`
   - Extract authenticated user from context (same pattern as existing wapi handlers)
   - Assign request struct to variable before passing to service
   - On success respond JSON `{"file_id": <int64>}` with status 201
   - On error map `service_errors.ErrUnauthorized` → 403, validation errors → 400, others → 500

5. **Register route** — in the wapi router, register `POST /api/upload/audio` → handler. Ensure auth middleware is applied.

6. **No proto changes needed** — this is a plain HTTP handler in `wapi/`, not a gRPC RPC.

---

## Patterns to follow

- `utils.CloseWithLog(c, "upload-handler")` — never `defer c.Close()`
- No inline struct literals in function calls — assign `UploadFileRequest{...}` to a local var first
- `rerrors.Wrap(err)` at storage layer; `service_errors.ErrUnauthorized` at service layer
- SQLC only — the new `InsertFileMeta` must be SQL in the `.sql` file, never a raw query string in Go
- Never hand-edit `internal/storage/pg/` — run `make codegen` and commit generated output

---

## Acceptance criteria

- [ ] `POST /api/upload/audio` accepts a valid audio file and returns `{"file_id": N}` with 201
- [ ] Request without `can_upload` permission returns 403
- [ ] Request with unsupported MIME type returns 400
- [ ] File is written to disk and a corresponding `files_meta` row exists in DB
- [ ] `go build ./...` passes with no errors
- [ ] No raw SQL strings in Go code
- [ ] No hand-edited generated files

---

## Context files to inject

- `CLAUDE.md` (root)
- `internal/transport/wapi/` — read existing handlers for the auth + response pattern
- `internal/service/service.go` — interface reference
- `internal/storage/pg/queries/files_meta.sql` — existing query patterns
- `internal/service/service_errors/` — error var reference
