-- name: UpsertUser :exec
INSERT INTO users
       (   tg_id,    tg_username)
VALUES ($1, $2)
ON CONFLICT (tg_id)
    DO UPDATE SET tg_username = EXCLUDED.tg_username;

-- name: SaveUserSettings :exec
INSERT INTO user_settings
        ( user_tg_id,    locale)
VALUES  ($1, $2)
ON CONFLICT (user_tg_id)
    DO UPDATE SET
    locale = EXCLUDED.locale;
-- name: SaveUserPermissions :exec
INSERT INTO user_permissions
       (  user_tg_id,  can_upload,   early_access,    can_delete)
VALUES ($1,$2, $3, $4);
