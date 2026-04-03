-- name: UpsertUser :exec
INSERT INTO users
    (username)
VALUES ($1)
ON CONFLICT (username)
    DO NOTHING;

-- name: GetUserById :one
SELECT id,
       username
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
    (user_id, can_upload, early_access, can_create_playlist)
VALUES ($1, $2, $3, $4);

