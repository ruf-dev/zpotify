-- +goose Up
-- +goose StatementBegin
ALTER TABLE user_permissions
    ADD COLUMN IF NOT EXISTS can_delete BIT DEFAULT '0';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- +goose StatementEnd
