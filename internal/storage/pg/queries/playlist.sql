-- name: CreatePlaylist :one
WITH created_playlist AS (
    INSERT INTO playlists (name, description, owner_id)
    VALUES ($1, $2, $3)
    RETURNING uuid)
INSERT INTO user_playlists (user_tg_id, playlist_id)
VALUES ($3, (SELECT uuid FROM created_playlist))
RETURNING playlist_id;


-- name: GetPlaylistWithAuth :one
SELECT uuid,
       name,
       description,
       is_public
FROM playlists
         LEFT JOIN user_playlists AS up
                   ON up.playlist_id = playlists.uuid
                       AND user_tg_id = $1
WHERE playlists.uuid = $2
  AND (
    playlists.is_public
        OR
    up.user_tg_id IS NOT NULL);