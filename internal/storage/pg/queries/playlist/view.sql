-- name: ListSongs :many
SELECT songs.id,
       songs.title,
       files_meta.duration_sec
FROM playlist_songs
         INNER JOIN songs ON songs.id = playlist_songs.song_id
         INNER JOIN files_meta ON files_meta.id = songs.file_id
WHERE playlist_uuid = $1
GROUP BY songs.id, songs.title, files_meta.duration_sec
;