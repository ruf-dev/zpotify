-- +goose Up
-- +goose StatementBegin
-- Opaque per-file progress snapshot ({path, downloaded_bytes, total_bytes} objects),
-- written wholesale on every sync tick alongside downloaded_bytes/total_bytes; never
-- queried into by the database, only rendered by the API layer.
ALTER TABLE torrent_downloads ADD COLUMN file_progress JSONB NOT NULL DEFAULT '[]';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE torrent_downloads DROP COLUMN file_progress;
-- +goose StatementEnd
