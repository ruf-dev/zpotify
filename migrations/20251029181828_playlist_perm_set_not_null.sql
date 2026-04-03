-- +goose Up
-- +goose StatementBegin

-- CREATE OR REPLACE VIEW users_full as
-- (
-- SELECT u.id,
--        u.tg_id,
--        u.tg_username,
--
--        settings.locale,
--
--        permissions.can_upload,
--        permissions.early_access,
--        permissions.can_delete,
--        permissions.can_create_playlist
-- FROM users u
--          JOIN user_settings AS settings
--               ON u.id = settings.user_id
--          JOIN user_permissions AS permissions
--               ON u.id = permissions.user_id)
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- +goose StatementEnd
