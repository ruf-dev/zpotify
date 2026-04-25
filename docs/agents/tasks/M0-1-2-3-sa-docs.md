# Task Brief — M0-1/2/3 · Docs / SA (upload flow)

**Area:** docs / solution architect
**Priority:** medium
**Goal:** Update the vault to reflect the new upload endpoint, any new service methods, and move tasks to shipped once QA passes.

---

## What was shipped

- **New HTTP endpoint:** `POST /api/upload/audio` in `internal/transport/wapi/` (not a gRPC RPC — plain HTTP multipart handler)
- **New service method:** `UploadFile(ctx, UploadFileRequest) (int64, error)` on the `Service` interface
- **New SQLC query:** `InsertFileMeta` in `files_meta.sql`
- **New frontend processes:** `UploadProcess` (HTTP), `SongProcess.createSong` (gRPC), `ArtistProcess.listArtists` (gRPC)
- **New frontend widgets/dialogs:** upload widget wired + `CreateSongWidget` + `CreateSongDialog`

---

## Vault update steps

### 1. `architecture/api.md`
Add a new section **"HTTP-only endpoints (wapi)"** (or extend if it exists):

```
| Method | Path | Auth | Permission | Description |
|---|---|---|---|---|
| POST | /api/upload/audio | required | can_upload | Upload audio file; returns file_id |
```

Also update the `SongAPI` row in the services table to note that `CreateSong` now has a known frontend caller (upload flow).

### 2. `architecture/database.md`
No schema changes were made in this task — `files_meta` table already existed. No update needed unless the `InsertFileMeta` query surface is worth noting. Skip if no change.

### 3. `roadmap/in-progress.md`
Once QA passes, **delete** the M0-1, M0-2, M0-3 entries from `roadmap/in-progress.md`.

### 4. `roadmap/backlog.md`
Remove M0-1, M0-2, and M0-3 entries from `roadmap/backlog.md` — they are shipped.

### 5. `agents/context-pack.md` — backend section
Add a note under the backend context:

> **HTTP upload handler pattern:** Audio file upload lives in `internal/transport/wapi/` as a plain `net/http` handler (not gRPC). Auth token extraction and permission checks follow the same pattern as other wapi handlers. Register routes in the wapi router.

---

## Acceptance criteria

- [ ] `architecture/api.md` lists `POST /api/upload/audio` with correct auth/permission annotations
- [ ] M0-1, M0-2, M0-3 removed from both `backlog.md` and `in-progress.md`
- [ ] `context-pack.md` backend section includes the wapi HTTP handler note
- [ ] No vault entries refer to these tasks as pending

---

## Context files to inject

- This task brief
- Git diff of the shipped changes
- `agents/context-pack.md`
- `architecture/api.md`
- `roadmap/backlog.md`
- `roadmap/in-progress.md`
