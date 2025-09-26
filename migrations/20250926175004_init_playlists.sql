-- +goose Up
-- +goose StatementBegin
CREATE TABLE playlists
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT
);

CREATE TABLE playlist_songs
(
    playlist_id  UUID references playlists (id),
    file_id      TEXT references songs (file_id),
    order_number int2 NOT NULL,

    unique (playlist_id, file_id, order_number)
);

INSERT INTO public.playlists (id, name, description)
VALUES ('3a608e96-38ae-470c-83f2-842fc4a70ed2', 'Global queue', null);

INSERT INTO playlist_songs (SELECT '3a608e96-38ae-470c-83f2-842fc4a70ed2',
                                   file_id,
                                   row_number() OVER (ORDER BY created_at DESC) order_id
                            FROM songs
                            ORDER BY order_id);

drop view playlists_view;
CREATE OR REPLACE VIEW playlists_view AS
WITH artists_agg AS (SELECT songs.file_id,
                            json_agg(
                                    json_build_object(
                                            'uuid', artists.uuid,
                                            'name', artists.name
                                    )
                                    ORDER BY array_position(songs.artists, artists.uuid)
                            ) as artists
                     FROM playlist_songs
                              JOIN songs ON playlist_songs.file_id = songs.file_id
                              JOIN artists ON artists.uuid = ANY (songs.artists)
                     GROUP BY songs.file_id)
SELECT songs.file_id               AS file_id,
       songs.title                 AS title,
       artists_agg.artists         AS artists,
       songs.duration_sec          AS duration_sec,
       playlist_songs.playlist_id  AS playlist_id,
       playlist_songs.order_number AS order_number
FROM playlist_songs
         JOIN songs ON songs.file_id = playlist_songs.file_id
         JOIN artists_agg ON artists_agg.file_id = playlist_songs.file_id
ORDER BY playlist_songs.order_number;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- +goose StatementEnd
