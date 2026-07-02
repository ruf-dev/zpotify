-- +goose Up
ALTER TABLE users ADD COLUMN liked_playlist_id UUID REFERENCES playlists (uuid);

-- +goose StatementBegin
DO $$
DECLARE
    u RECORD;
    new_playlist_uuid UUID;
BEGIN
    FOR u IN SELECT id, username FROM users WHERE liked_playlist_id IS NULL LOOP
        INSERT INTO playlists (name, description, is_public, owner_id)
        VALUES (u.username || '''s Likes', '', FALSE, u.id)
        RETURNING uuid INTO new_playlist_uuid;

        INSERT INTO user_playlists (user_id, playlist_id, order_id, can_add_songs, can_delete_songs, can_edit)
        VALUES (u.id,
                new_playlist_uuid,
                (SELECT COALESCE(MAX(order_id), 0) + 1 FROM user_playlists WHERE user_id = u.id),
                true, true, true);

        UPDATE users SET liked_playlist_id = new_playlist_uuid WHERE id = u.id;
    END LOOP;
END $$;
-- +goose StatementEnd

ALTER TABLE users ALTER COLUMN liked_playlist_id SET NOT NULL;

-- +goose Down
ALTER TABLE users DROP COLUMN liked_playlist_id;
