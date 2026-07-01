-- +goose Up
-- +goose StatementBegin
ALTER TABLE songs
    ADD COLUMN title_tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', title)) STORED;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX idx_songs_title_tsv ON songs USING GIN (title_tsv);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE VIEW song_search_view_v1 AS
(
SELECT s.id            AS id,
       s.title         AS title,
       s.created_at    AS created_at,
       fm.duration_sec AS duration_sec,
       fm.file_path    AS file_path,
       s.file_id       AS file_id,
       s.title_tsv     AS title_tsv
FROM songs s
         INNER JOIN files_meta fm ON fm.id = s.file_id
    );
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP VIEW song_search_view_v1;
-- +goose StatementEnd

-- +goose StatementBegin
DROP INDEX idx_songs_title_tsv;
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE songs DROP COLUMN title_tsv;
-- +goose StatementEnd
