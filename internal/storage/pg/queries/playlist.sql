-- name: CreatePlaylist :one
WITH created_playlist AS (
    INSERT INTO playlists (name, description, is_public, owner_id, year)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING uuid)
INSERT INTO user_playlists (user_id, playlist_id, order_id, can_add_songs, can_delete_songs)
VALUES ($4,
        (SELECT uuid FROM created_playlist),
        (SELECT
             COALESCE(MAX(order_id), 0) + 1
         FROM user_playlists WHERE user_id = $4),
        true, true)
RETURNING playlist_id;


-- name: GetPlaylistWithAuth :one
SELECT playlists.uuid,
       playlists.name,
       playlists.description,
       playlists.is_public,
       playlists.cover_file_id,
       fm.file_path AS cover_file_path,
       playlists.year,
       playlists.song_count
FROM playlists
         LEFT JOIN user_playlists AS up
                   ON up.playlist_id = playlists.uuid
                       AND user_id = $1
         LEFT JOIN files_meta fm ON fm.id = playlists.cover_file_id
WHERE playlists.uuid = $2
  AND (
    playlists.is_public
        OR
    up.user_id IS NOT NULL);

-- name: AddSongToPlaylist :exec
WITH inserted AS (
    INSERT INTO playlist_songs (playlist_uuid, song_id, order_number)
    VALUES ($1, $2, (SELECT COALESCE(MAX(order_number), 0) + 1 FROM playlist_songs WHERE playlist_uuid = $1))
    RETURNING playlist_uuid
)
UPDATE playlists SET song_count = song_count + 1 WHERE uuid = $1;

-- name: GetPlaylistArtists :many
SELECT a.uuid, a.name
FROM artists a
         JOIN playlists_artists pa ON pa.artist_uuid = a.uuid
WHERE pa.playlist_uuid = $1
ORDER BY pa.order_id;

-- name: AddPlaylistArtist :exec
INSERT INTO playlists_artists (playlist_uuid, artist_uuid, order_id)
VALUES ($1, $2, $3)
ON CONFLICT (playlist_uuid, artist_uuid) DO UPDATE SET order_id = EXCLUDED.order_id;

-- name: ClearPlaylistArtists :exec
DELETE FROM playlists_artists WHERE playlist_uuid = $1;

-- name: UpdatePlaylistCoverFileId :exec
UPDATE playlists SET cover_file_id = $2 WHERE uuid = $1;

-- name: UpdatePlaylist :exec
UPDATE playlists
SET name        = CASE WHEN $2::text != '' THEN $2::text ELSE name END,
    description = CASE WHEN $3::text != '' THEN $3::text ELSE description END,
    is_public   = CASE WHEN $4 THEN $4 ELSE is_public END,
    year        = COALESCE(sqlc.narg('year')::int4, year)
WHERE uuid = $1;

-- name: ListUserPlaylists :many
SELECT v.uuid, v.name, v.description, v.is_public, v.cover_file_id, v.song_count, v.year
FROM playlists_v2 v
JOIN user_playlists up ON up.playlist_id = v.uuid
WHERE up.user_id = $1
ORDER BY up.order_id
LIMIT $2 OFFSET $3;

-- name: CountUserPlaylists :one
SELECT COUNT(v.uuid) FROM playlists_v2 v
JOIN user_playlists up ON up.playlist_id = v.uuid
WHERE up.user_id = $1;

-- name: DecrementPlaylistSongCount :exec
UPDATE playlists SET song_count = GREATEST(song_count - 1, 0) WHERE uuid = $1;