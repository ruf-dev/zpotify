-- +goose Up
-- +goose StatementBegin
ALTER TABLE files_meta
    ADD COLUMN IF NOT EXISTS size_bytes INT4;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- +goose StatementEnd
