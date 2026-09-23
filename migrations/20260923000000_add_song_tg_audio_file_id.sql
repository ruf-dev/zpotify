-- +goose Up
-- +goose StatementBegin
ALTER TABLE songs
    ADD COLUMN tg_audio_file_id TEXT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE songs
    DROP COLUMN tg_audio_file_id;
-- +goose StatementEnd
