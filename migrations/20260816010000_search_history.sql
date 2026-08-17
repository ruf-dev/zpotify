-- +goose Up
-- +goose StatementBegin
CREATE TABLE search_history
(
    id                INT8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id           INT8 NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    query             TEXT        NOT NULL,
    finding_type      TEXT,
    finding_id        TEXT,
    finding_name      TEXT,
    finding_cover_url TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX search_history_user_id_created_at_idx ON search_history (user_id, created_at DESC);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE search_history;
-- +goose StatementEnd
