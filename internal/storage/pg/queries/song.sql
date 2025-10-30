-- name: GetSongByUniqueId :one
SELECT file_id,
       title,
       artists,
       duration_sec
FROM playlists_view
WHERE file_id = $1
    FETCH FIRST 1 ROW ONLY;