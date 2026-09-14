-- name: InsertTorrentDownload :one
INSERT INTO torrent_downloads (user_id, folder_name, info_hash, torrent_name)
VALUES (@user_id, @folder_name, @info_hash, @torrent_name)
RETURNING id, user_id, folder_name, info_hash, torrent_name, status, total_bytes,
    downloaded_bytes, imported_files, error, created_at, updated_at, file_progress;

-- name: GetTorrentDownloadByID :one
SELECT id, user_id, folder_name, info_hash, torrent_name, status, total_bytes,
    downloaded_bytes, imported_files, error, created_at, updated_at, file_progress
FROM torrent_downloads
WHERE id = @id
  AND user_id = @user_id;

-- name: GetTorrentDownloadByUserAndInfoHash :one
SELECT id, user_id, folder_name, info_hash, torrent_name, status, total_bytes,
    downloaded_bytes, imported_files, error, created_at, updated_at, file_progress
FROM torrent_downloads
WHERE user_id = @user_id
  AND info_hash = @info_hash
  AND status IN ('queued', 'downloading', 'importing', 'paused');

-- name: ListTorrentDownloadsByUser :many
SELECT id, user_id, folder_name, info_hash, torrent_name, status, total_bytes,
    downloaded_bytes, imported_files, error, created_at, updated_at, file_progress
FROM torrent_downloads
WHERE user_id = @user_id
  AND (@folder_name::text = '' OR folder_name = @folder_name::text)
ORDER BY created_at DESC;

-- name: ListActiveTorrentDownloads :many
SELECT id, user_id, folder_name, info_hash, torrent_name, status, total_bytes,
    downloaded_bytes, imported_files, error, created_at, updated_at, file_progress
FROM torrent_downloads
WHERE status IN ('queued', 'downloading', 'importing')
ORDER BY created_at;

-- name: UpdateTorrentDownloadProgress :exec
UPDATE torrent_downloads
SET downloaded_bytes = @downloaded_bytes,
    total_bytes       = @total_bytes,
    file_progress     = @file_progress,
    updated_at        = NOW()
WHERE id = @id;

-- name: UpdateTorrentDownloadStatus :exec
UPDATE torrent_downloads
SET status     = @status,
    updated_at = NOW()
WHERE id = @id;

-- name: SetTorrentDownloadError :exec
UPDATE torrent_downloads
SET status     = 'failed',
    error      = @error,
    updated_at = NOW()
WHERE id = @id;

-- name: SetTorrentDownloadImportedFiles :exec
UPDATE torrent_downloads
SET imported_files = @imported_files,
    updated_at     = NOW()
WHERE id = @id;

-- name: DeleteTorrentDownload :exec
DELETE FROM torrent_downloads
WHERE id = @id
  AND user_id = @user_id;
