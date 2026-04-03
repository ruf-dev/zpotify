-- name: ListUserPermissionsByUserId :one
SELECT user_id,
       can_upload,
       early_access,
       can_create_playlist
FROM user_permissions
WHERE user_id = $1;