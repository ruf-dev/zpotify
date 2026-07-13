-- +goose Up
WITH ranked AS (
    SELECT ctid, ROW_NUMBER() OVER (PARTITION BY playlist_uuid, song_id ORDER BY order_number) AS rn
    FROM playlist_songs
)
DELETE FROM playlist_songs
WHERE ctid IN (SELECT ctid FROM ranked WHERE rn > 1);

UPDATE playlists p
SET song_count = (SELECT COUNT(*) FROM playlist_songs ps WHERE ps.playlist_uuid = p.uuid);

ALTER TABLE playlist_songs DROP CONSTRAINT playlist_songs_playlist_uuid_song_id_order_number_key;
ALTER TABLE playlist_songs ADD CONSTRAINT playlist_songs_playlist_uuid_song_id_key UNIQUE (playlist_uuid, song_id);

-- +goose Down
ALTER TABLE playlist_songs DROP CONSTRAINT playlist_songs_playlist_uuid_song_id_key;
ALTER TABLE playlist_songs ADD CONSTRAINT playlist_songs_playlist_uuid_song_id_order_number_key UNIQUE (playlist_uuid, song_id, order_number);
