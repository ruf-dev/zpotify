-- +goose Up
ALTER TABLE user_playlists ADD COLUMN can_edit BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE user_playlists SET can_edit = TRUE WHERE can_delete_songs = TRUE;

-- +goose Down
ALTER TABLE user_playlists DROP COLUMN can_edit;
