-- name: CreateSong :one
INSERT INTO songs
    (file_id, title)
VALUES ($1, $2) RETURNING id;

-- name: UpdateSongTitle :exec
UPDATE songs SET title = $1 WHERE id = $2;

-- name: ClearSongArtists :exec
DELETE FROM songs_artists WHERE song_id = $1;
