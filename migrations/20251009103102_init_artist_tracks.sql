-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS songs_artists
(
    song_id   TEXT REFERENCES songs (file_id),
    artist_uuid UUID REFERENCES artists (uuid),
    order_id  INT2 NOT NULL,

    PRIMARY KEY (song_id, artist_uuid)
);

INSERT INTO songs_artists (song_id, artist_uuid, order_id)
SELECT
    s.file_id,
    artist_uuid,
            ORDINALITY AS order_id
FROM songs s,
unnest(s.artists) WITH ORDINALITY AS artist_uuid
ON CONFLICT (song_id, artist_uuid) DO NOTHING;

CREATE OR REPLACE VIEW playlists_view AS
WITH artists_agg AS (SELECT songs.file_id,
                            json_agg(
                                    json_build_object(
                                            'uuid', artists.uuid,
                                            'name', artists.name
                                    )
                                    ORDER BY songs_artists.order_id
                            ) as artists
                     FROM playlist_songs
                              JOIN songs ON playlist_songs.file_id = songs.file_id
                              JOIN songs_artists ON songs_artists.song_id = songs.file_id
                              JOIN artists ON artists.uuid = songs_artists.artist_uuid
                     GROUP BY songs.file_id)
SELECT songs.file_id                AS file_id,
       songs.title                  AS title,
       artists_agg.artists          AS artists,
       songs.duration_sec           AS duration_sec,
       playlist_songs.playlist_uuid AS playlist_uuid,
       playlist_songs.order_number  AS order_number
FROM playlist_songs
         JOIN songs ON songs.file_id = playlist_songs.file_id
         JOIN artists_agg ON artists_agg.file_id = playlist_songs.file_id
ORDER BY playlist_songs.order_number;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- +goose StatementEnd
