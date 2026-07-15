-- +goose Up
CREATE UNIQUE INDEX files_meta_file_path_unique ON files_meta (file_path);

-- +goose Down
DROP INDEX files_meta_file_path_unique;
