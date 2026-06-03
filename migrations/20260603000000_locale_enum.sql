-- +goose Up
-- +goose StatementBegin
ALTER TABLE user_settings DROP CONSTRAINT user_settings_locale_fkey;

CREATE TYPE locale AS ENUM ('en', 'ru');

ALTER TABLE user_settings ALTER COLUMN locale DROP DEFAULT;
ALTER TABLE user_settings ALTER COLUMN locale TYPE locale USING locale::locale;
ALTER TABLE user_settings ALTER COLUMN locale SET DEFAULT 'en'::locale;

DROP TABLE locales;

ALTER TABLE user_permissions ADD PRIMARY KEY (user_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS locales
(
    id TEXT PRIMARY KEY
);

INSERT INTO locales (id)
VALUES ('en'),
       ('ru')
ON CONFLICT DO NOTHING;

ALTER TABLE user_settings
    ALTER COLUMN locale TYPE TEXT USING locale::TEXT;

ALTER TABLE user_settings
    ADD CONSTRAINT user_settings_locale_fkey FOREIGN KEY (locale) REFERENCES locales (id);

DROP TYPE locale;
-- +goose StatementEnd
