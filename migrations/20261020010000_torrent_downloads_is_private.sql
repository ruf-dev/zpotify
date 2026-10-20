-- +goose Up
-- +goose StatementBegin
ALTER TABLE torrent_downloads ADD COLUMN is_private BOOLEAN NOT NULL DEFAULT FALSE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE torrent_downloads DROP COLUMN is_private;
-- +goose StatementEnd
