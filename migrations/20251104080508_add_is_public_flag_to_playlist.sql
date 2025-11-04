-- +goose Up
-- +goose StatementBegin
ALTER TABLE playlists
    ADD COLUMN is_public BOOLEAN DEFAULT FALSE NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
