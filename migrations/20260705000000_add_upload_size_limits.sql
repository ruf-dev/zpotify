-- +goose Up
ALTER TABLE user_permissions ADD COLUMN max_song_size_bytes INT8 NOT NULL DEFAULT 52428800;
ALTER TABLE user_permissions ADD COLUMN max_total_upload_bytes INT8 NOT NULL DEFAULT 419430400;

-- +goose Down
ALTER TABLE user_permissions DROP COLUMN max_song_size_bytes;
ALTER TABLE user_permissions DROP COLUMN max_total_upload_bytes;
