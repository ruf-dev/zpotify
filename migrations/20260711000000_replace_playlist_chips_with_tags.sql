-- +goose Up
-- +goose StatementBegin
DROP TABLE IF EXISTS playlist_chips;

CREATE TYPE album_tag_kind AS ENUM (
    'genre', 'mood', 'era', 'vibe', 'language', 'theme', 'hit', 'album_version'
);

CREATE TYPE album_version_kind AS ENUM (
    'deluxe', 'extended', 'remaster', 'anniversary', 'live'
);

CREATE TABLE album_tags
(
    id                   SERIAL PRIMARY KEY,
    playlist_uuid        UUID           NOT NULL REFERENCES playlists (uuid) ON DELETE CASCADE,
    kind                 album_tag_kind NOT NULL,
    value                TEXT           NOT NULL DEFAULT '',
    version_kind         album_version_kind,
    parent_playlist_uuid UUID REFERENCES playlists (uuid) ON DELETE SET NULL,
    order_id             INT8           NOT NULL DEFAULT 0,
    UNIQUE (playlist_uuid, kind, value)
);

CREATE TYPE song_tag_kind AS ENUM ('single');

CREATE TABLE song_tags
(
    id       SERIAL PRIMARY KEY,
    song_id  INT8          NOT NULL REFERENCES songs (id) ON DELETE CASCADE,
    kind     song_tag_kind NOT NULL,
    value    TEXT          NOT NULL DEFAULT '',
    order_id INT8          NOT NULL DEFAULT 0,
    UNIQUE (song_id, kind, value)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS song_tags;
DROP TYPE IF EXISTS song_tag_kind;
DROP TABLE IF EXISTS album_tags;
DROP TYPE IF EXISTS album_version_kind;
DROP TYPE IF EXISTS album_tag_kind;

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
