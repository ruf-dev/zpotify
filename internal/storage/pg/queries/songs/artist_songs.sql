-- name: ListArtistPrimarySongs :many
-- Singles: standalone tracks (not attached to any album playlist) where the
-- given artist is the primary artist (order_id = 0).
SELECT v.id,
       v.title,
       v.created_at,
       v.duration_sec,
       v.file_path,
       v.file_id,
       v.artist_info,
       v.cover_file_path
FROM song_search_view_v3 v
WHERE EXISTS (SELECT 1
              FROM songs_artists sa
              WHERE sa.song_id = v.id
                AND sa.artist_uuid = @artist_uuid
                AND sa.order_id = 0)
  AND NOT EXISTS (SELECT 1
                  FROM playlist_songs ps
                           JOIN playlists_artists pa ON pa.playlist_uuid = ps.playlist_uuid
                  WHERE ps.song_id = v.id)
ORDER BY v.created_at DESC
LIMIT @limit_;

-- name: ListArtistFeaturedSongs :many
-- Features: tracks where the given artist appears but is not the primary
-- artist (order_id != 0).
SELECT v.id,
       v.title,
       v.created_at,
       v.duration_sec,
       v.file_path,
       v.file_id,
       v.artist_info,
       v.cover_file_path
FROM song_search_view_v3 v
WHERE EXISTS (SELECT 1
              FROM songs_artists sa
              WHERE sa.song_id = v.id
                AND sa.artist_uuid = @artist_uuid
                AND sa.order_id != 0)
ORDER BY v.created_at DESC
LIMIT @limit_;
