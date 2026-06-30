-- +goose Up
ALTER TABLE playlists ADD COLUMN year       INT4;
ALTER TABLE playlists ADD COLUMN song_count INT4 NOT NULL DEFAULT 0;

UPDATE playlists p
SET song_count = (SELECT COUNT(*) FROM playlist_songs ps WHERE ps.playlist_uuid = p.uuid);

CREATE VIEW playlists_v2 AS
SELECT p.uuid, p.name, p.description, p.is_public, p.cover_file_id, p.song_count, p.year
FROM playlists p;

-- +goose Down
DROP VIEW IF EXISTS playlists_v2;
ALTER TABLE playlists DROP COLUMN IF EXISTS song_count;
ALTER TABLE playlists DROP COLUMN IF EXISTS year;
