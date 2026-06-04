-- +goose Up
-- +goose StatementBegin
CREATE TABLE playlists_artists
(
    playlist_uuid UUID REFERENCES playlists (uuid) NOT NULL,
    artist_uuid   UUID REFERENCES artists (uuid)   NOT NULL,
    order_id      INT8                             NOT NULL,
    UNIQUE (playlist_uuid, order_id),
    UNIQUE (playlist_uuid, artist_uuid)
);

ALTER TABLE playlists
    ADD COLUMN cover_file_id INT8 REFERENCES files_meta (id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE playlists
    DROP COLUMN cover_file_id;

DROP TABLE playlists_artists;
-- +goose StatementEnd
