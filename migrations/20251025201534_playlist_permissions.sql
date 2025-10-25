-- +goose Up
-- +goose StatementBegin
ALTER TABLE user_playlists
    ADD COLUMN IF NOT EXISTS can_delete_songs BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN IF NOT EXISTS can_add_songs    BOOLEAN DEFAULT FALSE NOT NULL
;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- +goose StatementEnd
