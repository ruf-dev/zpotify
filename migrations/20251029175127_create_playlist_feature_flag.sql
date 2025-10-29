-- +goose Up
-- +goose StatementBegin
ALTER TABLE user_permissions
    ADD COLUMN can_create_playlist BOOLEAN DEFAULT false;

ALTER TABLE user_permissions
    ADD PRIMARY KEY (user_tg_id);

ALTER TABLE user_settings
    ADD PRIMARY KEY (user_tg_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- +goose StatementEnd
