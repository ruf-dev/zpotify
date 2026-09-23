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
       file_id,
       cover_file_path
FROM song_base_view_v2 s
WHERE s.file_id = $1;

-- name: UpdateSongTitle :exec
UPDATE songs SET title = $1 WHERE id = $2;

-- name: GetSongTgAudioFileId :one
SELECT tg_audio_file_id
FROM songs
WHERE id = $1;

-- name: UpdateSongTgAudioFileId :exec
UPDATE songs
SET tg_audio_file_id = $2
WHERE id = $1;

-- name: ClearSongArtists :exec
DELETE FROM songs_artists WHERE song_id = $1;

-- name: GetSongById :one
SELECT id,
       title,
       created_at,
       duration_sec,
       file_path,
       file_id,
       cover_file_path
FROM song_base_view_v2 s
WHERE s.id = $1;

-- name: GetArtistsBySongId :many
SELECT a.uuid,
       a.name
FROM artists a
         JOIN songs_artists sa ON sa.artist_uuid = a.uuid
WHERE sa.song_id = $1
ORDER BY sa.order_id;

-- name: SearchSongsByTitle :many
WITH container AS (
    SELECT DISTINCT ON (ps.song_id) ps.song_id,
                                     p.uuid                                                                  AS playlist_uuid,
                                     p.name                                                                  AS playlist_name,
                                     EXISTS(SELECT 1
                                            FROM playlists_artists pa
                                            WHERE pa.playlist_uuid = p.uuid)                                 AS is_album
    FROM playlist_songs ps
             INNER JOIN playlists p ON p.uuid = ps.playlist_uuid
             LEFT JOIN user_playlists up ON up.playlist_id = p.uuid AND up.user_id = @user_id
    WHERE p.is_public
       OR up.user_id IS NOT NULL
    ORDER BY ps.song_id,
             EXISTS(SELECT 1 FROM playlists_artists pa WHERE pa.playlist_uuid = p.uuid) DESC,
             p.created_at
)
SELECT s.id,
       s.title,
       s.created_at,
       s.duration_sec,
       s.file_path,
       s.file_id,
       s.artist_info,
       s.cover_file_path,
       ts_rank(s.title_tsv, to_tsquery('simple', @query::text)) AS score,
       container.playlist_uuid                                 AS container_playlist_uuid,
       container.playlist_name                                 AS container_playlist_name,
       container.is_album                                      AS container_is_album
FROM song_search_view_v3 s
         LEFT JOIN container ON container.song_id = s.id
WHERE s.title_tsv @@ to_tsquery('simple', @query::text)
ORDER BY ts_rank(s.title_tsv, to_tsquery('simple', @query::text)) DESC, s.id
LIMIT @limit_ OFFSET @offset_;

-- name: GetSongTags :many
SELECT kind, value FROM song_tags
WHERE song_id = $1 ORDER BY order_id;

-- name: InsertSongTag :exec
INSERT INTO song_tags (song_id, kind, value, order_id)
VALUES ($1, $2, $3, $4)
ON CONFLICT (song_id, kind, value) DO NOTHING;

-- name: ClearSongTags :exec
DELETE FROM song_tags WHERE song_id = $1;
