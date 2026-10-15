-- +goose Up
CREATE TYPE playlist_kind AS ENUM ('PLAYLIST', 'SINGLE');

ALTER TABLE playlists
    ADD COLUMN kind playlist_kind NOT NULL DEFAULT 'PLAYLIST';

-- playlists_v4 stays untouched; v5 adds kind (view-versioning rule).
CREATE VIEW playlists_v5 AS
SELECT p.uuid,
       p.name,
       p.description,
       p.is_public,
       p.cover_file_id,
       fm.file_path AS cover_file_path,
       p.song_count,
       p.year,
       p.created_at,
       p.kind
FROM playlists p
         LEFT JOIN files_meta fm ON fm.id = p.cover_file_id;

-- +goose StatementBegin
DO $$
DECLARE
    s                 RECORD;
    new_playlist_uuid UUID;
BEGIN
    FOR s IN
        SELECT songs.id,
               songs.title,
               songs.created_at,
               (SELECT p.cover_file_id
                FROM playlist_songs ps
                         INNER JOIN playlists p ON p.uuid = ps.playlist_uuid
                WHERE ps.song_id = songs.id
                  AND p.cover_file_id IS NOT NULL
                ORDER BY p.created_at
                LIMIT 1) AS cover_file_id
        FROM songs
        WHERE EXISTS (SELECT 1
                      FROM songs_artists sa
                      WHERE sa.song_id = songs.id
                        AND sa.order_id = 0)
          AND NOT EXISTS (SELECT 1
                          FROM playlist_songs ps
                                   JOIN playlists_artists pa ON pa.playlist_uuid = ps.playlist_uuid
                          WHERE ps.song_id = songs.id)
        LOOP
            INSERT INTO playlists (name, description, is_public, owner_id, song_count, created_at, kind, cover_file_id)
            VALUES (s.title, '', TRUE, 1, 1, s.created_at, 'SINGLE', s.cover_file_id)
            RETURNING uuid INTO new_playlist_uuid;

            INSERT INTO playlist_songs (playlist_uuid, song_id, order_number)
            VALUES (new_playlist_uuid, s.id, 1);

            INSERT INTO playlists_artists (playlist_uuid, artist_uuid, order_id)
            SELECT new_playlist_uuid, sa.artist_uuid, sa.order_id
            FROM songs_artists sa
            WHERE sa.song_id = s.id;
        END LOOP;
END $$;
-- +goose StatementEnd

-- +goose Down
DELETE FROM playlist_songs WHERE playlist_uuid IN (SELECT uuid FROM playlists WHERE kind = 'SINGLE');
DELETE FROM playlists_artists WHERE playlist_uuid IN (SELECT uuid FROM playlists WHERE kind = 'SINGLE');
DELETE FROM user_playlists WHERE playlist_id IN (SELECT uuid FROM playlists WHERE kind = 'SINGLE');
DELETE FROM playlists WHERE kind = 'SINGLE';

DROP VIEW playlists_v5;
ALTER TABLE playlists DROP COLUMN kind;
DROP TYPE playlist_kind;
