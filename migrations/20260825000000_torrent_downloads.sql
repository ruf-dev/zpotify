-- +goose Up
-- +goose StatementBegin
CREATE TYPE torrent_download_status AS ENUM (
    'queued', 'downloading', 'importing', 'seeding', 'done', 'failed', 'canceled'
);

CREATE TABLE torrent_downloads (
    id               BIGSERIAL               PRIMARY KEY,
    user_id          BIGINT                  NOT NULL,
    folder_name      TEXT                    NOT NULL DEFAULT '',
    info_hash        TEXT                    NOT NULL,
    torrent_name     TEXT                    NOT NULL,
    status           torrent_download_status NOT NULL DEFAULT 'queued',
    total_bytes      BIGINT                  NOT NULL DEFAULT 0,
    downloaded_bytes BIGINT                  NOT NULL DEFAULT 0,
    imported_files   JSONB                   NOT NULL DEFAULT '[]',
    error            TEXT,
    created_at       TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_torrent_downloads_user_info_hash ON torrent_downloads (user_id, info_hash);

CREATE INDEX idx_torrent_downloads_active_status ON torrent_downloads (status)
    WHERE status IN ('queued', 'downloading', 'importing');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_torrent_downloads_active_status;
DROP INDEX IF EXISTS idx_torrent_downloads_user_info_hash;
DROP TABLE IF EXISTS torrent_downloads;
DROP TYPE IF EXISTS torrent_download_status;
-- +goose StatementEnd
