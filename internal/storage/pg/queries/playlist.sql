-- name: CreatePlaylist :one
INSERT INTO playlists (name, description)
VALUES ($1, $2) RETURNING uuid;
