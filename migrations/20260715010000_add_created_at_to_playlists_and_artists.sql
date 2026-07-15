-- +goose Up
ALTER TABLE playlists ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE artists ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- playlists_v2 stays untouched; bump to v3 so the feed query can read created_at
-- without touching existing callers (view-versioning rule).
CREATE VIEW playlists_v3 AS
SELECT p.uuid, p.name, p.description, p.is_public, p.cover_file_id, p.song_count, p.year, p.created_at
FROM playlists p;

-- +goose Down
DROP VIEW IF EXISTS playlists_v3;
ALTER TABLE artists DROP COLUMN IF EXISTS created_at;
ALTER TABLE playlists DROP COLUMN IF EXISTS created_at;
