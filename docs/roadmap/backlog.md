# Roadmap — backlog

Tasks not yet started. Move to [[roadmap/in-progress]] when picked up.

---

## M0 — "It Works" · target: ~May 9

### M0-4 · Song library view
**Area:** frontend
**Summary:** Page listing all songs. Shows title, artists, duration. Click to play. Zustand store for playback state. Uses existing `PlaylistAPI` (global playlist) or a new `SongAPI.ListSongs` RPC if needed. Sortable by title / artist / date added.

### M0-5 · Playback bar
**Area:** frontend
**Summary:** Persistent bottom bar: current song info, play/pause, previous/next, scrubber, volume. Reads from global Zustand playback store. Audio via `<audio>` element pointed at nginx:8085 stream URL.

### M0-6 · Playlist management UI
**Area:** frontend
**Summary:** Create playlist, add songs to playlist, reorder (drag), remove, play playlist. Calls existing `PlaylistAPI` RPCs. List of user playlists in sidebar.

---

## M1 — "The Library" · target: ~May 30

### M1-1 · Album domain model (DB + backend)
**Area:** backend
**Summary:** New migration: `albums` table (uuid, title, year, type ENUM: LP/EP/Single/Live/Compilation/Soundtrack, playlist_id FK, created_at). New migration: `album_versions` table (uuid, album_id FK, label e.g. "Deluxe", "Remaster", "Original", playlist_id FK pointing to version-specific tracklist). Run `moti g` + `sqlc generate` after proto changes. New `AlbumAPI` service proto with: `CreateAlbum`, `GetAlbum`, `ListAlbumsByArtist`, `CreateAlbumVersion`.

### M1-2 · Song → Album linkage
**Area:** backend
**Summary:** Songs in an album are members of the album's playlist (or version's playlist). No new join table needed. Album version's playlist IS the tracklist. Document this in architecture/database.md.

### M1-3 · Physical file deduplication
**Area:** backend
**Summary:** On upload, hash the audio file (SHA-256). Store hash in `files_meta`. Before writing to disk, check if hash exists — if so, reuse existing file row. Multiple `songs` rows can point to one `files_meta`. Add `file_hash` column via migration.

### M1-4 · Artist page (backend)
**Area:** backend
**Summary:** New `ArtistsAPI.GetArtist` RPC returning artist detail + paginated discography grouped by album type. Query must separate LP/EP/Single from Live/Compilation. Artist UUID is the key.

### M1-5 · Artist page (frontend)
**Area:** frontend
**Summary:** Artist page with tabs: Albums · Singles & EPs · Live · Compilations. Each tab shows album cards (cover, title, year). No "everything in one pile" — strict type separation. Route: `/artist/:id`.

### M1-6 · Album page (frontend)
**Area:** frontend
**Summary:** Album page: cover art, title, year, type badge. Tracklist ordered. Version switcher (dropdown/tabs) if multiple versions exist — swaps tracklist in place without navigation. Route: `/album/:id`. Play album button queues the version's playlist.

---

## M2 — "Alpha Release" · target: ~June 20

### M2-1 · Cover art upload & storage
**Area:** backend + frontend
**Summary:** HTTP endpoint to upload image (JPEG/PNG/WebP, max 10MB). Store on disk under `/covers/`. `albums` and `artists` tables get `cover_path` column. Frontend: cover upload widget reusable for both album and artist pages.

### M2-2 · Artist card UI
**Area:** frontend
**Summary:** Artist card component: photo (if set, else generated placeholder), name, album count, top genres (future). Used in search results, song detail, album page. Component in `components/artist-card/`.

### M2-3 · Search (backend)
**Area:** backend
**Summary:** New `SearchAPI` proto service. `Search(query string)` returns `SearchResults` with buckets: songs[], albums[], artists[]. Use PostgreSQL `ILIKE` + trigram index (pg_trgm). No ML. Return top 5 per bucket.

### M2-4 · Search (frontend)
**Area:** frontend
**Summary:** Search bar in header (always visible). Debounced input → calls `SearchAPI`. Results dropdown with sections: Songs, Albums, Artists. Click navigates to entity or queues song.

### M2-5 · Responsive mobile layout
**Area:** frontend
**Summary:** Audit and fix layout for 375px–768px viewports. Bottom nav bar on mobile (Home, Library, Search). Playback bar collapses to mini-bar. No new pages needed — existing pages must reflow. CSS variable breakpoints only, no px literals.

### M2-6 · Home page
**Area:** frontend
**Summary:** Home page populated from `user_home_segments`. Show: Recently added albums, Your playlists, Continue listening (last played). Uses existing home segments API if present, otherwise extend it. Route: `/`.

---

## M3 — "Polish & Public Prep" · target: July 2

### M3-1 · Admin panel
**Area:** frontend + backend
**Summary:** `/admin` route, guarded by a new `is_admin` permission flag. User list with ability to toggle `can_upload`, `can_create_playlist`, `early_access`. New `AdminAPI` proto service. Only `root` user (id=1) has `is_admin` at seed time.

### M3-2 · Public playlist / album sharing
**Area:** backend + frontend
**Summary:** Playlists (and by extension albums) with `visibility=public` are accessible without auth via `/share/:uuid`. Read-only view: tracklist, play button (streams still require nginx access — consider if this needs auth bypass or a signed URL). 

### M3-3 · Bulk track upload
**Area:** frontend + backend
**Summary:** Upload widget accepts multiple files at once. Each file goes through the same upload → create song flow in sequence with a queue UI. No folder support yet — just multi-file picker. Progress per file.

### M3-4 · README + product narrative
**Area:** docs
**Summary:** Rewrite README.md for the public repo. Sections: what zpotify is (the philosophy — musician library, not content platform), quick self-host guide (Docker Compose), screenshots, roadmap link. Short, opinionated, honest.

### M3-5 · Alpha feedback squash
**Area:** backend + frontend
**Summary:** Reserved sprint for bugs surfaced during closed alpha (M2 release to friends/family). No pre-defined scope — triage from feedback.
