-- +goose Up
ALTER TABLE artists ADD COLUMN avatar_file_id INT8 REFERENCES files_meta (id);
ALTER TABLE artists ADD COLUMN background_cover_file_id INT8 REFERENCES files_meta (id);

-- +goose Down
ALTER TABLE artists DROP COLUMN avatar_file_id;
ALTER TABLE artists DROP COLUMN background_cover_file_id;
