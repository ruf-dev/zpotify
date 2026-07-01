-- name: CreateSong :one
INSERT INTO songs
    (file_id, title)
VALUES ($1, $2) RETURNING id;

-- name: GetSongByFileId :one
SELECT id,
       title,
       created_at,
       duration_sec,
       file_path,
       file_id
FROM song_base_view_v1 s
WHERE s.file_id = $1;

-- name: UpdateSongTitle :exec
UPDATE songs SET title = $1 WHERE id = $2;

-- name: ClearSongArtists :exec
DELETE FROM songs_artists WHERE song_id = $1;

-- name: GetSongById :one
SELECT id,
       title,
       created_at,
       duration_sec,
       file_path,
       file_id
FROM song_base_view_v1 s
WHERE s.id = $1;

-- name: GetArtistsBySongId :many
SELECT a.uuid,
       a.name
FROM artists a
         JOIN songs_artists sa ON sa.artist_uuid = a.uuid
WHERE sa.song_id = $1
ORDER BY sa.order_id;

-- name: SearchSongsByTitle :many
SELECT id,
       title,
       created_at,
       duration_sec,
       file_path,
       file_id
FROM song_search_view_v1
WHERE title_tsv @@ to_tsquery('simple', @query::text)
ORDER BY ts_rank(title_tsv, to_tsquery('simple', @query::text)) DESC, id
LIMIT @limit_ OFFSET @offset_;
