-- +goose Up
-- +goose StatementBegin
ALTER TABLE songs
    DROP CONSTRAINT songs_file_id_fkey,
    ADD CONSTRAINT songs_file_id_fkey FOREIGN KEY (file_id) REFERENCES files_meta (id) ON DELETE CASCADE;

ALTER TABLE songs_artists
    DROP CONSTRAINT songs_artists_song_id_fkey,
    ADD CONSTRAINT songs_artists_song_id_fkey FOREIGN KEY (song_id) REFERENCES songs (id) ON DELETE CASCADE;

ALTER TABLE playlist_songs
    DROP CONSTRAINT playlist_songs_song_id_fkey,
    ADD CONSTRAINT playlist_songs_song_id_fkey FOREIGN KEY (song_id) REFERENCES songs (id) ON DELETE CASCADE;

ALTER TABLE playlists
    DROP CONSTRAINT playlists_cover_file_id_fkey,
    ADD CONSTRAINT playlists_cover_file_id_fkey FOREIGN KEY (cover_file_id) REFERENCES files_meta (id) ON DELETE SET NULL;

ALTER TABLE artists
    DROP CONSTRAINT artists_avatar_file_id_fkey,
    ADD CONSTRAINT artists_avatar_file_id_fkey FOREIGN KEY (avatar_file_id) REFERENCES files_meta (id) ON DELETE SET NULL,
    DROP CONSTRAINT artists_background_cover_file_id_fkey,
    ADD CONSTRAINT artists_background_cover_file_id_fkey FOREIGN KEY (background_cover_file_id) REFERENCES files_meta (id) ON DELETE SET NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE artists
    DROP CONSTRAINT artists_background_cover_file_id_fkey,
    ADD CONSTRAINT artists_background_cover_file_id_fkey FOREIGN KEY (background_cover_file_id) REFERENCES files_meta (id),
    DROP CONSTRAINT artists_avatar_file_id_fkey,
    ADD CONSTRAINT artists_avatar_file_id_fkey FOREIGN KEY (avatar_file_id) REFERENCES files_meta (id);

ALTER TABLE playlists
    DROP CONSTRAINT playlists_cover_file_id_fkey,
    ADD CONSTRAINT playlists_cover_file_id_fkey FOREIGN KEY (cover_file_id) REFERENCES files_meta (id);

ALTER TABLE playlist_songs
    DROP CONSTRAINT playlist_songs_song_id_fkey,
    ADD CONSTRAINT playlist_songs_song_id_fkey FOREIGN KEY (song_id) REFERENCES songs (id);

ALTER TABLE songs_artists
    DROP CONSTRAINT songs_artists_song_id_fkey,
    ADD CONSTRAINT songs_artists_song_id_fkey FOREIGN KEY (song_id) REFERENCES songs (id);

ALTER TABLE songs
    DROP CONSTRAINT songs_file_id_fkey,
    ADD CONSTRAINT songs_file_id_fkey FOREIGN KEY (file_id) REFERENCES files_meta (id);
-- +goose StatementEnd
