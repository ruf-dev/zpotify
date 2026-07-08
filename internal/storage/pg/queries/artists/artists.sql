-- name: LikeArtist :exec
INSERT INTO user_artists (user_id, artist_id)
VALUES ($1, $2)
ON CONFLICT DO NOTHING;

-- name: UnlikeArtist :exec
DELETE FROM user_artists WHERE user_id = $1 AND artist_id = $2;
