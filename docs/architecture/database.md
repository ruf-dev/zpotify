# Architecture — database

## Engine & tooling

- **PostgreSQL 17**
- **Goose** — migrations (`migrations/` folder, timestamp-named files)
- **SQLC** — generates Go query code from SQL; never hand-edit `internal/storage/pg/`
- **Squirrel** — SQL query builder for dynamic queries

---

## Core tables

| Table | Purpose |
|---|---|
| `users` | Identity — username, int8 id |
| `user_identities` | Auth providers (currently: `ZPOTIFY` password-based) |
| `user_permissions` | Per-user feature flags (upload, playlist, early access) |
| `user_settings` | UI preferences (locale) |
| `user_sessions` | Access + refresh token pairs with expiry |
| `files_meta` | Audio file metadata: path, duration, size, verified flag |
| `songs` | Song entries linked to a file |
| `artists` | Artist name + UUID |
| `songs_artists` | Many-to-many: song ↔ artist with ordering |
| `playlists` | Name, description, visibility, owner |
| `playlist_songs` | Ordered songs within a playlist |
| `user_playlists` | User ↔ playlist relationship with per-user permissions |
| `user_home_segments` | Customisable home page sections (type: playlist) |

---

## Key relationships

```
users ──< user_sessions
users ──< user_permissions
users ──< files_meta (uploaded_by)
files_meta ──── songs (1:1)
songs >──< artists  (via songs_artists, ordered)
playlists ──< playlist_songs ──< songs
users >──< playlists (via user_playlists, with can_add/can_delete flags)
```

---

## Conventions

- Public-facing IDs: UUID (artists, playlists)
- Internal IDs: `INT8 GENERATED ALWAYS AS IDENTITY` (users, songs, files)
- Timestamps: `TIMESTAMP` (no timezone)
- Seed data: `root` user (id=1) and global playlist (uuid=`00000000-...`) inserted at migration time

---

## Key view

`playlists_songs_v1` — joins playlist_songs → songs → files_meta → artists into a single row per song with aggregated artist JSON. Used for playlist listing queries.
