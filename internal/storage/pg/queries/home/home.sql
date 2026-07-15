-- name: ListFeedDays :many
SELECT day FROM (
    SELECT date_trunc('day', created_at)::date AS day FROM playlists
    UNION
    SELECT date_trunc('day', created_at)::date AS day FROM songs
    UNION
    SELECT date_trunc('day', created_at)::date AS day FROM artists
) all_days
ORDER BY day DESC
LIMIT @limit_ OFFSET @offset_;

-- name: CountFeedDays :one
SELECT COUNT(*) AS total FROM (
    SELECT date_trunc('day', created_at)::date AS day FROM playlists
    UNION
    SELECT date_trunc('day', created_at)::date AS day FROM songs
    UNION
    SELECT date_trunc('day', created_at)::date AS day FROM artists
) all_days;
