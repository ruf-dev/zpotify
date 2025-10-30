-- +goose Up
-- +goose StatementBegin
ALTER TABLE songs
    ALTER COLUMN title SET NOT NULL,
    ALTER COLUMN duration_sec SET NOT NULL;

CREATE OR REPLACE VIEW public.playlists_view(file_id, title, artists, duration_sec, playlist_uuid, order_number) as
WITH artists_agg AS (SELECT songs_1.file_id,
                            json_agg(json_build_object('uuid', artists.uuid, 'name', artists.name)
                                     ORDER BY songs_artists.order_id) AS artists
                     FROM playlist_songs playlist_songs_1
                              JOIN songs songs_1 ON playlist_songs_1.file_id = songs_1.file_id
                              JOIN songs_artists ON songs_artists.song_id = songs_1.file_id
                              JOIN artists ON artists.uuid = songs_artists.artist_uuid
                     GROUP BY songs_1.file_id)
SELECT songs.file_id,
       songs.title,
       artists_agg.artists,
       songs.duration_sec,
       playlist_songs.playlist_uuid,
       playlist_songs.order_number
FROM playlist_songs
         JOIN songs ON songs.file_id = playlist_songs.file_id
         JOIN artists_agg ON artists_agg.file_id = playlist_songs.file_id
ORDER BY playlist_songs.order_number;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- +goose StatementEnd
