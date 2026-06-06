-- +goose Up
-- +goose StatementBegin
CREATE VIEW playlists_v1 AS
SELECT p.uuid,
       p.name,
       p.description,
       p.is_public,
       p.cover_file_id,
       COUNT(ps.song_id) AS song_count
FROM playlists p
LEFT JOIN playlist_songs ps ON ps.playlist_uuid = p.uuid
GROUP BY p.uuid, p.name, p.description, p.is_public, p.cover_file_id;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP VIEW playlists_v1;
-- +goose StatementEnd
