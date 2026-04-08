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

INSERT INTO users(username)
VALUES ('root');

INSERT INTO playlists (uuid, name, description, owner_id)
VALUES ('00000000-0000-0000-0000-000000000000', 'Global queue', '', 1);

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
);


CREATE OR REPLACE VIEW playlists_songs_v1 AS
(
SELECT playlist_songs.playlist_uuid                                                                                  AS playlist_uuid,
       songs.id                                                                                                      AS id,
       songs.title                                                                                                   AS title,
       files_meta.duration_sec                                                                                       AS duration_sec,
       json_agg(json_build_object('uuid', artists.uuid::text, 'name', artists.name)
                order by songs_artists.order_id)                                                                     AS artist_info,
       playlist_songs.order_number
FROM playlist_songs
         INNER JOIN songs ON songs.id = playlist_songs.song_id
         INNER JOIN files_meta ON files_meta.id = songs.file_id

         INNER JOIN songs_artists on songs.id = songs_artists.song_id
         INNER JOIN artists on artists.uuid = songs_artists.artist_uuid
GROUP BY playlist_songs.playlist_uuid,
         songs.id,
         songs.title,
         files_meta.duration_sec,
         playlist_songs.order_number
    );


-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- +goose StatementEnd
