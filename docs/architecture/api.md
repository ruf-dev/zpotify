# Architecture — API & transport

## Transport layer

gRPC handlers live in `internal/transport/*_api_impl/`. REST is exposed via grpc-gateway at `/api/*`. Both share the same handler code — grpc-gateway translates HTTP → gRPC internally.

Audio upload and streaming have dedicated HTTP handlers in `internal/transport/wapi/` (not gRPC).

---

## Services and their RPCs

| Service | Key operations |
|---|---|
| `AuthAPI` | Login with password, async Telegram auth, refresh token, list auth methods |
| `UserAPI` | Get current user, get user settings |
| `SongAPI` | Create song entry |
| `PlaylistAPI` | List songs, add/remove/reorder songs, create/get/delete playlist |
| `FileMetaAPI` | List uploaded files, get file metadata |
| `ArtistsAPI` | List artists |
| `ZpotifyAPI` | Version check |

---

## Auth flow

1. Client calls `Auth` with login/password (or Telegram data)
2. Server returns `access_token` + `refresh_token` with expiry timestamps
3. Client attaches `access_token` to every request
4. On expiry, client calls `RefreshToken` to get a new pair
5. Telegram async flow: client polls via streaming RPC until Telegram confirms identity

**Bypass (dev only):** `debug_auth: true` in config allows `Z-Tg-Id` / `Z-Tg-Username` headers to skip token validation.

**Unauthenticated routes:** `Version` and all `AuthAPI` RPCs are public.

---

## Permissions

Per-user flags stored in DB:
- `can_upload` — allowed to upload audio files
- `can_create_playlist` — allowed to create playlists
- `early_access` — access to unreleased features

---

## Proto conventions

- Proto files: `api/grpc/zpotify_*.proto`
- Generated Go: `internal/api/server/zpotify_api/` (never hand-edit)
- Generated TypeScript: `pkg/web/@zpotify/api/` (never hand-edit)
- Code generation via `moti g` (configured in `moti.yaml`)
- Common types: `Paging`, `SongBase`, `ArtistBase`, `Playlist`, `AuthData`
