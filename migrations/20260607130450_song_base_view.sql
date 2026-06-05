-- +goose Up
-- +goose StatementBegin
CREATE VIEW song_base_view_v1 AS
(
SELECT s.id            AS id,
       s.title         AS title,
       s.created_at    AS created_at,
       fm.duration_sec AS duration_sec,
       fm.file_path    AS file_path,
       s.file_id       AS file_id
FROM songs s
         INNER JOIN files_meta fm ON fm.id = s.file_id
    );
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP VIEW song_base_view_v1;
-- +goose StatementEnd
