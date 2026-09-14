-- +goose Up
-- +goose StatementBegin
-- A paused torrent is still an active job (see domain.ActiveTorrentDownloadStatuses), but the
-- partial index from 20260914000000 omitted it, so re-submitting a paused torrent's .torrent
-- file bypassed dedup and started a second job for the same (user_id, info_hash).
DROP INDEX IF EXISTS idx_torrent_downloads_user_info_hash;
CREATE UNIQUE INDEX idx_torrent_downloads_user_info_hash ON torrent_downloads (user_id, info_hash)
    WHERE status IN ('queued', 'downloading', 'importing', 'paused');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_torrent_downloads_user_info_hash;
CREATE UNIQUE INDEX idx_torrent_downloads_user_info_hash ON torrent_downloads (user_id, info_hash)
    WHERE status IN ('queued', 'downloading', 'importing');
-- +goose StatementEnd
