-- +goose Up
ALTER TABLE user_permissions ADD COLUMN can_edit_artists BOOLEAN NOT NULL DEFAULT FALSE;

-- +goose Down
ALTER TABLE user_permissions DROP COLUMN can_edit_artists;
