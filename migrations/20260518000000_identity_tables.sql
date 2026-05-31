-- +goose Up
-- +goose StatementBegin

CREATE TABLE identity_telegram (
    telegram_id    BIGINT    PRIMARY KEY,
    user_id        INT8      NOT NULL REFERENCES users(id),
    login          TEXT      NOT NULL,
    last_logged_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE identity_zpotify (
    user_id  INT8 PRIMARY KEY REFERENCES users(id),
    login    TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- Migrate ZPOTIFY identities from user_identities
INSERT INTO identity_zpotify (user_id, login, password)
SELECT ui.user_id, u.username, ui.payload->>'password'
FROM user_identities ui
JOIN users u ON u.id = ui.user_id
WHERE ui.identity_provider = 'ZPOTIFY'
  AND ui.payload->>'password' IS NOT NULL;

-- Invalidate all sessions: telegram users can't be migrated, zpotify users must re-login
DELETE FROM user_sessions;

-- Remove telegram-only users (id == tgId, no zpotify identity); they will be re-created on next login
DELETE FROM users WHERE id NOT IN (SELECT user_id FROM identity_zpotify);

DROP TABLE user_identities;
DROP TYPE identity_provider;

-- Prevent manual ID insertion going forward
ALTER TABLE users ALTER COLUMN id SET GENERATED ALWAYS;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS identity_zpotify;
DROP TABLE IF EXISTS identity_telegram;
-- +goose StatementEnd
