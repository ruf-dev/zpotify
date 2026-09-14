-- +goose Up
-- +goose StatementBegin
-- Recreate the unique index on (user_id, info_hash) as a partial index that only covers active statuses.
-- This allows canceled/failed/done torrents to coexist with new active ones on the same (user_id, info_hash),
-- matching the status filter in GetTorrentDownloadByUserAndInfoHash query (lines 19-20 of torrent_downloads.sql).
DROP INDEX IF EXISTS idx_torrent_downloads_user_info_hash;
CREATE UNIQUE INDEX idx_torrent_downloads_user_info_hash ON torrent_downloads (user_id, info_hash)
    WHERE status IN ('queued', 'downloading', 'importing');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- Restore the original non-partial index.
DROP INDEX IF EXISTS idx_torrent_downloads_user_info_hash;
CREATE UNIQUE INDEX idx_torrent_downloads_user_info_hash ON torrent_downloads (user_id, info_hash);
-- +goose StatementEnd
