-- +goose Up
-- +goose StatementBegin
CREATE TABLE garbage_collector (
    id         BIGSERIAL PRIMARY KEY,
    file_path  TEXT        NOT NULL,
    added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS garbage_collector;
-- +goose StatementEnd
