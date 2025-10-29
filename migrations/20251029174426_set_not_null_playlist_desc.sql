-- +goose Up
-- +goose StatementBegin

UPDATE playlists
SET description = ''
WHERE description is null;

ALTER TABLE playlists
    ALTER COLUMN description SET DEFAULT '',
    ALTER COLUMN description SET NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- +goose StatementEnd
