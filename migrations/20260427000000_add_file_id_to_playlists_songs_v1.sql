-- +goose Up
CREATE OR REPLACE VIEW playlists_songs_v2 AS
(
SELECT playlist_songs.playlist_uuid              AS playlist_uuid,
       songs.id                                  AS id,
       songs.title                               AS title,
       files_meta.duration_sec                   AS duration_sec,
       files_meta.file_path                      AS file_path,
       songs.file_id                             AS file_id,
       json_agg(json_build_object('uuid', artists.uuid::text, 'name', artists.name)
                order by songs_artists.order_id) AS artist_info,
       playlist_songs.order_number
FROM playlist_songs
         INNER JOIN songs ON songs.id = playlist_songs.song_id
         INNER JOIN files_meta ON files_meta.id = songs.file_id
         INNER JOIN songs_artists on songs.id = songs_artists.song_id
         INNER JOIN artists on artists.uuid = songs_artists.artist_uuid
GROUP BY playlist_songs.playlist_uuid,
         songs.id,
         songs.title,
         files_meta.file_path,
         files_meta.duration_sec,
         songs.file_id,
         playlist_songs.order_number
    );

-- +goose Down
CREATE OR REPLACE VIEW playlists_songs_v1 AS
(
SELECT playlist_songs.playlist_uuid              AS playlist_uuid,
       songs.id                                  AS id,
       songs.title                               AS title,
       files_meta.duration_sec                   AS duration_sec,
       files_meta.file_path                      AS file_path,
       json_agg(json_build_object('uuid', artists.uuid::text, 'name', artists.name)
                order by songs_artists.order_id) AS artist_info,
       playlist_songs.order_number
FROM playlist_songs
         INNER JOIN songs ON songs.id = playlist_songs.song_id
         INNER JOIN files_meta ON files_meta.id = songs.file_id
         INNER JOIN songs_artists on songs.id = songs_artists.song_id
         INNER JOIN artists on artists.uuid = songs_artists.artist_uuid
GROUP BY playlist_songs.playlist_uuid,
         songs.id,
         songs.title,
         files_meta.file_path,
         files_meta.duration_sec,
         playlist_songs.order_number
    );