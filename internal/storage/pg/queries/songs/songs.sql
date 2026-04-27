-- name: CreateSong :one
INSERT INTO songs
    (file_id, title)
VALUES ($1, $2) RETURNING id;

-- name: UpdateSongTitle :exec
UPDATE songs SET title = $1 WHERE id = $2;

-- name: ClearSongArtists :exec
DELETE FROM songs_artists WHERE song_id = $1;

-- name: GetSongById :one
SELECT s.id,
       s.title,
       s.created_at,
       fm.duration_sec,
       fm.file_path,
       s.file_id
FROM songs s
         JOIN files_meta fm ON fm.id = s.file_id
WHERE s.id = $1;

-- name: GetArtistsBySongId :many
SELECT a.uuid,
       a.name
FROM artists a
         JOIN songs_artists sa ON sa.artist_uuid = a.uuid
WHERE sa.song_id = $1
ORDER BY sa.order_id;
