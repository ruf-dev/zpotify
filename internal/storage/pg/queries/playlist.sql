-- name: CreatePlaylist :one
WITH created_playlist AS (
    INSERT INTO playlists (name, description, is_public, owner_id)
        VALUES ($1, $2, $3, $4)
        RETURNING uuid)
INSERT INTO user_playlists (user_id, playlist_id, order_id)
VALUES ($4,
        (SELECT uuid FROM created_playlist),
        (SELECT COALESCE(MAX(order_id), 0) + 1 FROM user_playlists WHERE user_id = $4))
RETURNING playlist_id;


-- name: GetPlaylistWithAuth :one
SELECT uuid,
       name,
       description,
       is_public,
       cover_file_id
FROM playlists
         LEFT JOIN user_playlists AS up
                   ON up.playlist_id = playlists.uuid
                       AND user_id = $1
WHERE playlists.uuid = $2
  AND (
    playlists.is_public
        OR
    up.user_id IS NOT NULL);

-- name: AddSongToPlaylist :exec
INSERT INTO playlist_songs (playlist_uuid, song_id, order_number)
VALUES ($1, $2, (SELECT COALESCE(MAX(order_number), 0) + 1 FROM playlist_songs WHERE playlist_uuid = $1));

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
    is_public   = CASE WHEN $4 THEN $4 ELSE is_public END
WHERE uuid = $1;