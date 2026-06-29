-- +goose Up
-- +goose StatementBegin
CREATE TYPE feature_flag_id AS ENUM (
    'is_comments_on_album_enabled'
);

CREATE TABLE feature_flags (
    id         feature_flag_id PRIMARY KEY,
    is_enabled BOOLEAN         NOT NULL DEFAULT false,
    value      JSONB           NOT NULL DEFAULT '{}',
    comment    TEXT            NOT NULL DEFAULT ''
);

INSERT INTO feature_flags (id, is_enabled, comment)
VALUES ('is_comments_on_album_enabled', false, 'Show comment section on album page');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE feature_flags;
DROP TYPE feature_flag_id;
-- +goose StatementEnd
