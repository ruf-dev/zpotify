-- +goose Up
-- +goose StatementBegin
ALTER TABLE playlists
    ADD COLUMN name_tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', name)) STORED;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX idx_playlists_name_tsv ON playlists USING GIN (name_tsv);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE VIEW playlist_search_view_v1 AS
(
SELECT p.uuid                             AS uuid,
       p.name                             AS name,
       p.description                      AS description,
       p.is_public                        AS is_public,
       p.cover_file_id                    AS cover_file_id,
       cover_fm.file_path                 AS cover_file_path,
       p.song_count                       AS song_count,
       p.year                             AS year,
       p.created_at                       AS created_at,
       p.name_tsv                         AS name_tsv,
       COALESCE(artist_agg.artist_info, '[]') AS artist_info
FROM playlists p
         LEFT JOIN files_meta cover_fm ON cover_fm.id = p.cover_file_id
         LEFT JOIN LATERAL (
    SELECT json_agg(json_build_object('uuid', a.uuid::text, 'name', a.name)
                     ORDER BY pa.order_id) AS artist_info
    FROM playlists_artists pa
             INNER JOIN artists a ON a.uuid = pa.artist_uuid
    WHERE pa.playlist_uuid = p.uuid
    ) artist_agg ON true
    );
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP VIEW playlist_search_view_v1;
-- +goose StatementEnd

-- +goose StatementBegin
DROP INDEX idx_playlists_name_tsv;
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE playlists DROP COLUMN name_tsv;
-- +goose StatementEnd
