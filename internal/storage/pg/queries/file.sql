-- name: GetFileById :one
SELECT id,
       file_path,
       duration_sec,
       added_by_id,
       size_bytes,
       verified,
       content_hash
FROM files_meta
WHERE id = $1;

-- name: GetFileBySongId :one
SELECT fm.id,
       fm.file_path,
       fm.duration_sec,
       fm.added_by_id,
       fm.size_bytes,
       fm.verified,
       fm.content_hash
FROM files_meta fm
JOIN songs s ON s.file_id = fm.id
WHERE s.id = $1;

-- name: CreateFile :one
INSERT INTO files_meta (file_path, duration_sec, added_by_id, size_bytes, verified, content_hash)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id;

-- name: GetFileByPath :one
SELECT id,
       file_path,
       duration_sec,
       added_by_id,
       size_bytes,
       verified,
       content_hash
FROM files_meta
WHERE file_path = $1;

-- name: GetFileByHash :one
SELECT id,
       file_path,
       duration_sec,
       added_by_id,
       size_bytes,
       verified,
       content_hash
FROM files_meta
WHERE content_hash = $1
  AND added_by_id = $2;

-- name: DeleteFileById :exec
DELETE FROM files_meta
WHERE id = $1;

-- name: UpdateFile :exec
UPDATE files_meta
SET duration_sec = $2,
    size_bytes = $3,
    verified = $4
WHERE id = $1;
