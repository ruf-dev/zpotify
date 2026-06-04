-- +goose Up
ALTER TABLE user_permissions ADD COLUMN max_pending_tracks INT8 NOT NULL DEFAULT 0;

-- +goose Down
ALTER TABLE user_permissions DROP COLUMN max_pending_tracks;
