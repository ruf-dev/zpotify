-- name: ListStorages :many
SELECT s.id,
       s.name,
       s.kind,
       s.config_enc,
       s.is_default,
       s.owner_user_id,
       s.quota_bytes,
       COALESCE(SUM(fm.size_bytes), 0)::BIGINT AS used_bytes
FROM storages s
         LEFT JOIN files_meta fm ON fm.storage_id = s.id
GROUP BY s.id
ORDER BY s.created_at;

-- name: GetStorageById :one
SELECT id,
       name,
       kind,
       config_enc,
       is_default,
       owner_user_id,
       quota_bytes
FROM storages
WHERE id = $1;

-- name: GetDefaultStorage :one
SELECT id,
       name,
       kind,
       config_enc,
       is_default,
       owner_user_id,
       quota_bytes
FROM storages
WHERE is_default;

-- name: CreateStorage :one
INSERT INTO storages (name, kind, config_enc, owner_user_id, quota_bytes)
VALUES ($1, $2, $3, $4, $5)
RETURNING id,
    name,
    kind,
    config_enc,
    is_default,
    owner_user_id,
    quota_bytes;

-- name: UpdateStorage :exec
UPDATE storages
SET name       = $2,
    config_enc = $3
WHERE id = $1;

-- name: DeleteStorageById :exec
DELETE FROM storages
WHERE id = $1;

-- name: ClearDefaultStorage :exec
UPDATE storages
SET is_default = FALSE
WHERE is_default;

-- name: SetDefaultStorageById :exec
UPDATE storages
SET is_default = TRUE
WHERE id = $1;

-- name: GetStorageUsageBytes :one
SELECT COALESCE(SUM(size_bytes), 0)::BIGINT AS used_bytes
FROM files_meta
WHERE storage_id = $1;

-- name: CountFilesByStorage :one
SELECT COUNT(*)::BIGINT AS files_count
FROM files_meta
WHERE storage_id = $1;
