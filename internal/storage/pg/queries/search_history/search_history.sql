-- name: InsertSearchQuery :one
INSERT INTO search_history (user_id, query, created_at)
VALUES (@user_id, @query, now())
RETURNING id, user_id, query, finding_type, finding_id, finding_name, finding_cover_url, created_at;

-- name: AttachSearchFinding :execrows
UPDATE search_history AS sh
SET finding_type      = @finding_type,
    finding_id        = @finding_id,
    finding_name      = @finding_name,
    finding_cover_url = @finding_cover_url
WHERE sh.id = (
    SELECT sh2.id
    FROM search_history AS sh2
    WHERE sh2.user_id = @user_id
      AND sh2.query = @query
    ORDER BY sh2.created_at DESC
    LIMIT 1
);

-- name: ListSearchHistory :many
SELECT id, user_id, query, finding_type, finding_id, finding_name, finding_cover_url, created_at
FROM search_history
WHERE user_id = @user_id
ORDER BY created_at DESC
LIMIT 5;

-- name: TrimSearchHistory :exec
DELETE FROM search_history AS sh
WHERE sh.user_id = @user_id
  AND sh.id NOT IN (
    SELECT sh2.id
    FROM search_history AS sh2
    WHERE sh2.user_id = @user_id
    ORDER BY sh2.created_at DESC
    LIMIT 5
);
