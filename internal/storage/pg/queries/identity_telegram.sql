-- name: UpsertTelegramIdentity :one
INSERT INTO identity_telegram (telegram_id, user_id, login, last_logged_at)
VALUES ($1, $2, $3, now())
ON CONFLICT (telegram_id)
    DO UPDATE SET
        login          = EXCLUDED.login,
        last_logged_at = now()
RETURNING user_id;

-- name: GetTelegramIdentityByTgId :one
SELECT telegram_id, user_id, login, last_logged_at
FROM identity_telegram
WHERE telegram_id = $1;
