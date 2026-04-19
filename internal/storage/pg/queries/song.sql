
-- name: GetSongById :one
SELECT id,
       file_id,
       title,
       created_at
FROM songs
WHERE id = $1;

-- name: DeleteSongById :exec
DELETE
FROM files_meta
WHERE id = $1;

-- name: UpsertSongArtist :exec
INSERT INTO songs_artists
    (song_id, artist_uuid, order_id)
VALUES ($1, $2, $3)
ON CONFLICT (song_id, artist_uuid)
    DO UPDATE SET order_id = excluded.order_id;