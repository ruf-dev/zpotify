-- name: GetFileById :one
SELECT id,
       file_path,
       duration_sec,
       added_by_id,
       size_bytes
FROM files_meta
WHERE id = $1;

-- name: DeleteFileById :exec
DELETE FROM files_meta
WHERE id = $1;