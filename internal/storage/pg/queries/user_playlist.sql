-- name: GetUserPermissionsOnPlaylist :one
SELECT can_delete_songs,
       can_add_songs
FROM user_playlists
WHERE user_tg_id = $1
  AND playlist_id = $2
    FETCH FIRST 1 ROW ONLY;