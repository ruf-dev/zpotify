-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS users
(
    tg_id       INT8 NOT NULL PRIMARY KEY,
    tg_username TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS locales
(
    id TEXT PRIMARY KEY
);

INSERT INTO locales (id)
VALUES ('en'),
       ('ru')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS user_settings
(
    user_tg_id INT4 REFERENCES users (tg_id)  UNIQUE,
    locale  TEXT REFERENCES locales (id) NOT NULL DEFAULT 'en'
);

CREATE TABLE IF NOT EXISTS admins
(
    user_tg_id    INT4 REFERENCES users (tg_id),
    can_edit   BIT DEFAULT '0' NOT NULL,
    can_review BIT DEFAULT '0' NOT NULL
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- +goose StatementEnd
