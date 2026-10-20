-- +goose Up
-- +goose StatementBegin
ALTER TABLE torrent_downloads ADD COLUMN trackers TEXT[] NOT NULL DEFAULT '{}';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE torrent_downloads DROP COLUMN trackers;
-- +goose StatementEnd
