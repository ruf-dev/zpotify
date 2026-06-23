-- +goose Up
-- +goose StatementBegin
INSERT INTO jobs (queue_name, payload)
SELECT 'audio_parser',
       jsonb_build_object('file_id', id, 'file_path', file_path)
FROM files_meta
WHERE duration_sec = 0;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM jobs
WHERE queue_name = 'audio_parser'
  AND status = 'pending';
-- +goose StatementEnd
