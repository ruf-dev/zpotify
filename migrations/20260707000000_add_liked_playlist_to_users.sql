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

-- Column is intentionally left nullable: CreateUser inserts a user row before
-- that user's liked playlist can exist (playlists.owner_id requires the user
-- to already exist), so liked_playlist_id is only set afterwards via
-- SetUserLikedPlaylist. A NOT NULL constraint here breaks every new user
-- insert.

-- +goose Down
DELETE FROM user_playlists WHERE playlist_id IN (SELECT liked_playlist_id FROM users WHERE liked_playlist_id IS NOT NULL);
DELETE FROM playlists WHERE uuid IN (SELECT liked_playlist_id FROM users WHERE liked_playlist_id IS NOT NULL);
ALTER TABLE users DROP COLUMN liked_playlist_id;
