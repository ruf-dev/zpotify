-- +goose Up
ALTER TABLE songs ADD CONSTRAINT songs_file_id_unique UNIQUE (file_id);

-- +goose Down
ALTER TABLE songs DROP CONSTRAINT songs_file_id_unique;
