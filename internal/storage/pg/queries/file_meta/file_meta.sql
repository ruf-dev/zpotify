-- name: UpdateFileMeta :exec
UPDATE files_meta
SET file_path    = $1,
    duration_sec = $2,
    size_bytes   = $3,
    verified     = $4,
    content_hash = $5
WHERE id = $6;