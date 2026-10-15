-- +goose Up
ALTER TABLE user_permissions ADD COLUMN is_administrator BOOLEAN NOT NULL DEFAULT FALSE;

-- +goose Down
ALTER TABLE user_permissions DROP COLUMN is_administrator;
