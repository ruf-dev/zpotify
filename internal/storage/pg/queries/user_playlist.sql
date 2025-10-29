-- name: GetUserPermissionsOnPlaylist :one
SELECT can_delete_songs,
       can_add_songs
FROM user_playlists
WHERE user_tg_id = $1
  AND playlist_id = $2
    FETCH FIRST 1 ROW ONLY;

-- name: UpsertUserPlaylist :exec
INSERT INTO user_playlists (user_tg_id, playlist_id, order_id, can_delete_songs, can_add_songs)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (user_tg_id, playlist_id, order_id)
    DO UPDATE SET can_delete_songs = excluded.can_delete_songs,
                  can_add_songs    = excluded.can_add_songs;

