-- name: GetZpotifyIdentityByLogin :one
SELECT user_id, login, password
FROM identity_zpotify
WHERE login = $1;
