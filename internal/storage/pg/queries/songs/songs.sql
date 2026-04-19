-- name: CreateSong :one
INSERT INTO songs
    (file_id, title)
VALUES ($1, $2) RETURNING id;
