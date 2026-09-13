-- +goose NO TRANSACTION
-- +goose Up
-- +goose StatementBegin
ALTER TYPE torrent_download_status ADD VALUE 'paused';
-- +goose StatementEnd

-- +goose Down
-- Postgres cannot drop an enum value; this migration is irreversible.
