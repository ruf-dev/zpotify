-- name: ListUserPermissionsByUserId :one
SELECT user_id,
       can_upload,
       early_access,
       can_create_playlist,
       max_pending_tracks,
       max_song_size_bytes,
       max_total_upload_bytes
FROM user_permissions
WHERE user_id = $1;