-- +goose Up
-- +goose StatementBegin
ALTER TABLE files_meta ADD COLUMN content_hash TEXT NOT NULL DEFAULT '';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE files_meta DROP COLUMN content_hash;
-- +goose StatementEnd
