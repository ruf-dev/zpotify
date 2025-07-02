-- +goose Up
-- +goose StatementBegin
CREATE TABLE users
(
    id          SERIAL PRIMARY KEY,
    tg_id       INT8 NOT NULL,
    tg_username TEXT NOT NULL
);

CREATE TYPE user_locale AS ENUM ('en', 'ru');

CREATE TABLE user_settings
(
    user_id INT4 REFERENCES users (id),
    locale  user_locale NOT NULL
);

CREATE TABLE admins
(
    user_id    INT4 REFERENCES users (id),
    can_edit   BIT DEFAULT '0',
    can_review BIT DEFAULT '0'
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
