-- name: LikeArtist :exec
INSERT INTO user_artists (user_id, artist_id)
VALUES ($1, $2)
ON CONFLICT DO NOTHING;

-- name: UnlikeArtist :exec
DELETE FROM user_artists WHERE user_id = $1 AND artist_id = $2;

-- name: SearchArtistsByName :many
SELECT uuid,
       name,
       created_at,
       ts_rank(name_tsv, to_tsquery('simple', @query::text)) AS score
FROM artist_search_view_v1
WHERE name_tsv @@ to_tsquery('simple', @query::text)
ORDER BY ts_rank(name_tsv, to_tsquery('simple', @query::text)) DESC, uuid
LIMIT @limit_ OFFSET @offset_;
