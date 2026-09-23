-- +goose Up
-- +goose StatementBegin
CREATE VIEW song_base_view_v2 AS
(
SELECT s.id            AS id,
       s.title         AS title,
       s.created_at    AS created_at,
       fm.duration_sec AS duration_sec,
       fm.file_path    AS file_path,
       s.file_id       AS file_id,
       cover_fm.file_path AS cover_file_path
FROM songs s
         INNER JOIN files_meta fm ON fm.id = s.file_id
         LEFT JOIN LATERAL (
    SELECT p.cover_file_id
    FROM playlist_songs ps
             INNER JOIN playlists p ON p.uuid = ps.playlist_uuid
             INNER JOIN playlists_artists pa ON pa.playlist_uuid = p.uuid
    WHERE ps.song_id = s.id
    LIMIT 1
    ) album ON true
         LEFT JOIN files_meta cover_fm ON cover_fm.id = album.cover_file_id
    );
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP VIEW song_base_view_v2;
-- +goose StatementEnd
