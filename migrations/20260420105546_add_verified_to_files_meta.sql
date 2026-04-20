-- +goose Up
-- +goose StatementBegin
ALTER TABLE files_meta ADD COLUMN verified BOOLEAN DEFAULT false NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE files_meta DROP COLUMN verified;
-- +goose StatementEnd
