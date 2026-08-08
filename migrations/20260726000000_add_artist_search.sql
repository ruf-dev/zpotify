-- +goose Up
-- +goose StatementBegin
ALTER TABLE artists
    ADD COLUMN name_tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', name)) STORED;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX idx_artists_name_tsv ON artists USING GIN (name_tsv);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE VIEW artist_search_view_v1 AS
(
SELECT a.uuid            AS uuid,
       a.name             AS name,
       a.created_at       AS created_at,
       a.name_tsv         AS name_tsv,
       avatar_fm.file_path AS avatar_file_path
FROM artists a
         LEFT JOIN files_meta avatar_fm ON avatar_fm.id = a.avatar_file_id
    );
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP VIEW artist_search_view_v1;
-- +goose StatementEnd

-- +goose StatementBegin
DROP INDEX idx_artists_name_tsv;
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE artists DROP COLUMN name_tsv;
-- +goose StatementEnd
