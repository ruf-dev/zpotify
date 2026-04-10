-- name: GetFileById :one
SELECT id,
       file_path,
       duration_sec,
       added_by_id,
       size_bytes
FROM files_meta
WHERE id = $1;

-- name: CreateFile :one
INSERT INTO files_meta (file_path, duration_sec, added_by_id, size_bytes)
VALUES ($1, $2, $3, $4)
RETURNING id;

-- name: DeleteFileById :exec
DELETE FROM files_meta
WHERE id = $1;

-- name: UpdateFile :exec
UPDATE files_meta
SET duration_sec = $2,
    size_bytes = $3
WHERE id = $1;