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
    user_tg_id INT8 REFERENCES users (tg_id) UNIQUE,
    locale     TEXT REFERENCES locales (id) NOT NULL DEFAULT 'en'
);

CREATE TABLE IF NOT EXISTS user_permissions
(
    user_tg_id INT8 REFERENCES users (tg_id),
    can_upload BIT DEFAULT '0' NOT NULL
);

CREATE TABLE IF NOT EXISTS files_meta
(
    tg_unique_id   TEXT NOT NULL UNIQUE,
    tg_file_id     TEXT NOT NULL,
    tg_file_path   TEXT NOT NULL,
    added_by_tg_id INT8 NOT NULL
);

CREATE TABLE IF NOT EXISTS user_sessions
(
    user_id           INT8 REFERENCES users (tg_id),
    access_token      TEXT PRIMARY KEY,
    refresh_token     TEXT UNIQUE,
    access_expire_at  TIMESTAMP,
    refresh_expire_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artists
(
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT
);

CREATE TABLE IF NOT EXISTS songs
(
    file_id      TEXT REFERENCES files_meta (tg_unique_id) PRIMARY KEY,
    artists      UUID[],
    title       TEXT,
    duration_sec INT4,
    created_at   TIMESTAMP DEFAULT now()
);


-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- +goose StatementEnd
