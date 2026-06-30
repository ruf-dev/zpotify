-- +goose Up
-- +goose StatementBegin
CREATE TABLE playlist_chips
(
    id            SERIAL,
    playlist_uuid UUID NOT NULL REFERENCES playlists (uuid) ON DELETE CASCADE,
    kind          TEXT NOT NULL,
    value         TEXT NOT NULL,
    order_id      INT8 NOT NULL DEFAULT 0,
    UNIQUE (playlist_uuid, kind, value)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE playlist_chips;
-- +goose StatementEnd
