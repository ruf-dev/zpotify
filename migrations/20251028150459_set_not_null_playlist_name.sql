-- +goose Up
-- +goose StatementBegin
ALTER TABLE playlists
    ALTER COLUMN name SET NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
    
-- +goose StatementEnd
