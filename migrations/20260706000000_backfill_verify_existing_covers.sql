-- +goose Up
-- +goose StatementBegin
UPDATE files_meta
SET verified = true
WHERE verified = false
  AND file_path ~* '\.(jpg|jpeg|png|webp|gif)$';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
UPDATE files_meta
SET verified = false
WHERE verified = true
  AND file_path ~* '\.(jpg|jpeg|png|webp|gif)$';
-- +goose StatementEnd
