-- name: AddGarbageFile :exec
INSERT INTO garbage_collector (file_path)
VALUES ($1);

-- name: ListGarbageFiles :many
SELECT id,
       file_path,
       added_at,
       deleted_at
FROM garbage_collector
WHERE deleted_at IS NULL;

-- name: MarkGarbageFileDeleted :exec
UPDATE garbage_collector
SET deleted_at = NOW()
WHERE id = $1;

-- name: ClaimGarbageFiles :many
SELECT id,
       file_path,
       added_at,
       deleted_at
FROM garbage_collector
WHERE deleted_at IS NULL
ORDER BY added_at
FOR UPDATE SKIP LOCKED
LIMIT $1;
