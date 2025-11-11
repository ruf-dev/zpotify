-- +goose Up
-- +goose StatementBegin
ALTER TABLE playlists
    ADD COLUMN owner_id BIGINT REFERENCES users (tg_id);

ALTER TABLE playlist_songs
    ADD UNIQUE (playlist_uuid, file_id, order_number);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
