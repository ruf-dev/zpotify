-- +goose Up
-- playlists_v3 stays untouched; bump to v4 so the feed query can read the
-- resolved cover file path without touching existing callers (view-versioning rule).
CREATE VIEW playlists_v4 AS
SELECT p.uuid, p.name, p.description, p.is_public, p.cover_file_id, fm.file_path AS cover_file_path, p.song_count, p.year, p.created_at
FROM playlists p
         LEFT JOIN files_meta fm ON fm.id = p.cover_file_id;

-- +goose Down
DROP VIEW IF EXISTS playlists_v4;
