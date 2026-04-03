-- name: GetUserSessionByAccessToken :one
SELECT user_sessions.user_id,
       user_sessions.access_token,
       user_sessions.refresh_token,
       user_sessions.access_expire_at,
       user_sessions.refresh_expire_at
FROM user_sessions
         LEFT JOIN user_permissions
                   ON user_sessions.user_id = user_permissions.user_id
WHERE access_token = $1;


-- name: GetUserSessionByRefreshToken :one
SELECT user_sessions.user_id,
       user_sessions.access_token,
       user_sessions.refresh_token,
       user_sessions.access_expire_at,
       user_sessions.refresh_expire_at
FROM user_sessions
         LEFT JOIN user_permissions
                   ON user_sessions.user_id = user_permissions.user_id
WHERE refresh_token = $1;

-- name: ListSessionsByUserId :many
SELECT user_sessions.user_id,
       user_sessions.access_token,
       user_sessions.refresh_token,
       user_sessions.access_expire_at,
       user_sessions.refresh_expire_at
FROM user_sessions
         LEFT JOIN user_permissions ON user_sessions.user_id = user_permissions.user_id
WHERE user_sessions.user_id = $1
ORDER BY refresh_expire_at DESC;


-- name: DeleteExpiredSessions :exec
DELETE FROM user_sessions
WHERE refresh_expire_at < now();