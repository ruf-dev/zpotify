-- +goose Up
-- +goose StatementBegin
ALTER TABLE user_permissions
    ALTER COLUMN can_create_playlist SET NOT NULL;

CREATE OR REPLACE VIEW users_full as
(
SELECT u.tg_id,
       u.tg_username,

       settings.locale,

       permissions.can_upload,
       permissions.early_access,
       permissions.can_delete,
       permissions.can_create_playlist
FROM users u
         JOIN user_settings AS settings
              ON u.tg_id = settings.user_tg_id
         JOIN user_permissions AS permissions
              ON u.tg_id = permissions.user_tg_id)
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- +goose StatementEnd
