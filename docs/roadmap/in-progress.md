# Roadmap — in progress

Tasks currently being worked on. Move back to [[roadmap/backlog]] if paused, or delete when shipped.

---

## M0-1 · Web upload flow (backend)
**Area:** backend
**Summary:** HTTP upload handler in `internal/transport/wapi/`: accept audio file, write to disk, create `files_meta` row, return file ID. MIME + size validation. `can_upload` permission gate.
**Status:** Task brief written, ready for coder agent

## M0-2 · Web upload flow (frontend)
**Area:** frontend
**Summary:** Upload page/widget. File picker → POST to upload endpoint → on success open Create Song form pre-filled with filename. Progress indicator.
**Status:** Design implemented, task brief written, ready for coder agent

## M0-3 · Create song entry (frontend)
**Area:** frontend
**Summary:** Form: title, artist(s) multi-select with create-new, file_id link. Calls `SongAPI.CreateSong` RPC.
**Status:** Task brief written, ready for coder agent
