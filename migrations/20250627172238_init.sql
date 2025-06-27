-- +goose Up
-- +goose StatementBegin
CREATE TABLE users
(
    id          SERIAL PRIMARY KEY,
    tg_id       INT8,
    tg_username TEXT
);

CREATE TYPE user_locale AS ENUM ('en', 'ru');

CREATE TABLE user_settings
(
    user_id INT4 REFERENCES users (id),
    locale  user_locale
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
