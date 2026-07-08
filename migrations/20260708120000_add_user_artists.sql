-- +goose Up
CREATE TABLE IF NOT EXISTS user_artists
(
    user_id   INT8        NOT NULL REFERENCES users (id),
    artist_id UUID        NOT NULL REFERENCES artists (uuid),
    liked_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, artist_id)
);

-- +goose Down
DROP TABLE user_artists;
