-- name: CreatePlaylist :one
INSERT INTO playlists (name, description)
VALUES ($1, $2)
RETURNING uuid;


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