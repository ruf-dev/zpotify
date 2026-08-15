-- +goose Up
-- +goose StatementBegin
CREATE VIEW song_search_view_v3 AS
(
SELECT s.id                             AS id,
       s.title                          AS title,
       s.created_at                     AS created_at,
       fm.duration_sec                  AS duration_sec,
       fm.file_path                     AS file_path,
       s.file_id                        AS file_id,
       s.title_tsv                      AS title_tsv,
       COALESCE(artist_agg.artist_info, '[]') AS artist_info,
       cover_fm.file_path               AS cover_file_path
FROM songs s
         INNER JOIN files_meta fm ON fm.id = s.file_id
         LEFT JOIN LATERAL (
    SELECT json_agg(json_build_object('uuid', a.uuid::text, 'name', a.name)
                     ORDER BY sa.order_id) AS artist_info
    FROM songs_artists sa
             INNER JOIN artists a ON a.uuid = sa.artist_uuid
    WHERE sa.song_id = s.id
    ) artist_agg ON true
         LEFT JOIN LATERAL (
    SELECT p.cover_file_id
    FROM playlist_songs ps
             INNER JOIN playlists p ON p.uuid = ps.playlist_uuid
             INNER JOIN playlists_artists pa ON pa.playlist_uuid = p.uuid
    WHERE ps.song_id = s.id
    LIMIT 1
    ) album ON true
         LEFT JOIN LATERAL (
    SELECT p.cover_file_id
    FROM playlist_songs ps
             INNER JOIN playlists p ON p.uuid = ps.playlist_uuid
    WHERE ps.song_id = s.id
      AND p.cover_file_id IS NOT NULL
    ORDER BY p.created_at
    LIMIT 1
    ) any_playlist ON true
         LEFT JOIN files_meta cover_fm ON cover_fm.id = COALESCE(album.cover_file_id, any_playlist.cover_file_id)
    );
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP VIEW song_search_view_v3;
-- +goose StatementEnd
