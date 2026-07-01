-- name: InsertUser :one
INSERT INTO users (username, avatar_link)
VALUES ($1, $2)
RETURNING id;

-- name: UpsertUser :exec
INSERT INTO users (id, username, avatar_link)
VALUES ($1, $2, $3)
ON CONFLICT (id)
    DO UPDATE SET username    = EXCLUDED.username,
                  avatar_link = EXCLUDED.avatar_link;
-- name: GetUserById :one
SELECT id,
       username,
       avatar_link
FROM users
WHERE id = $1;

-- name: SaveUserSettings :exec
INSERT INTO user_settings
    (user_id, locale)
VALUES ($1, $2)
ON CONFLICT (user_id)
    DO UPDATE SET locale = EXCLUDED.locale;

-- name: SaveUserPermissions :exec
INSERT INTO user_permissions
    (user_id, can_upload, early_access, can_create_playlist, max_pending_tracks, max_song_size_bytes, max_total_upload_bytes)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (user_id) DO UPDATE SET can_upload             = EXCLUDED.can_upload,
                                    early_access           = EXCLUDED.early_access,
                                    can_create_playlist    = EXCLUDED.can_create_playlist,
                                    max_pending_tracks     = EXCLUDED.max_pending_tracks,
                                    max_song_size_bytes    = EXCLUDED.max_song_size_bytes,
                                    max_total_upload_bytes = EXCLUDED.max_total_upload_bytes;

