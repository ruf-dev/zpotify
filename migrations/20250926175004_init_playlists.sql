-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS playlists
(
    uuid        UUID PRIMARY KEY                    DEFAULT gen_random_uuid(),
    name        TEXT                       NOT NULL,
    description TEXT                       NOT NULL DEFAULT '',
    is_public   BOOLEAN                             DEFAULT FALSE NOT NULL,
    owner_id    INT2 REFERENCES users (id) NOT NULL
);

CREATE TABLE IF NOT EXISTS playlist_songs
(
    playlist_uuid UUID NOT NULL references playlists (uuid),
    song_id       INT4 NOT NULL references songs (id),
    order_number  INT2 NOT NULL,

    unique (playlist_uuid, song_id, order_number)
);

INSERT INTO playlists (uuid, name, description, owner_id)
VALUES ('00000000-0000-0000-0000-000000000000', 'Global queue', null, 0);

INSERT INTO playlist_songs (SELECT '00000000-0000-0000-0000-000000000000',
                                   file_id,
                                   row_number() OVER (ORDER BY created_at DESC) order_id
                            FROM songs
                            ORDER BY order_id);

CREATE TABLE IF NOT EXISTS user_playlists
(
    user_id          INT2    NOT NULL REFERENCES users (id),
    playlist_id      UUID    NOT NULL REFERENCES playlists (uuid),
    order_id         INT2    NOT NULL,
    can_delete_songs BOOLEAN NOT NULL DEFAULT FALSE,
    can_add_songs    BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (user_id, playlist_id),
    UNIQUE (user_id, playlist_id, order_id)
)
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- +goose StatementEnd
