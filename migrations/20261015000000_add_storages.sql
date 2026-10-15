-- +goose Up
CREATE TYPE storage_kind AS ENUM ('local', 's3', 'webdav', 'google_drive');

CREATE TABLE storages
(
    id            UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    name          TEXT         NOT NULL UNIQUE,
    kind          storage_kind NOT NULL,
    -- opaque: AES-GCM encrypted config blob, storage layer never reads inside
    config_enc    BYTEA        NOT NULL DEFAULT '',
    is_default    BOOLEAN      NOT NULL DEFAULT FALSE,
    owner_user_id INT8         REFERENCES users (id) ON DELETE CASCADE,
    quota_bytes   INT8,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX storages_one_default ON storages (is_default) WHERE is_default;

-- seeded system row so every existing file keeps working
INSERT INTO storages (id, name, kind, is_default)
VALUES ('00000000-0000-0000-0000-000000000001', 'local', 'local', TRUE);

ALTER TABLE files_meta
    ADD COLUMN storage_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES storages (id);

-- +goose Down
ALTER TABLE files_meta DROP COLUMN storage_id;
DROP INDEX storages_one_default;
DROP TABLE storages;
DROP TYPE storage_kind;
