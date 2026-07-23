-- name: CreateNotification :one
INSERT INTO notifications (title, body_markdown, requires_consent)
VALUES (@title, @body_markdown, @requires_consent)
RETURNING id, title, body_markdown, requires_consent, created_at;

-- name: SnapshotNotificationRecipients :exec
INSERT INTO notification_recipients (notification_id, user_id)
SELECT @notification_id, id
FROM users;

-- name: ListNotificationsForUser :many
SELECT n.id, n.title, n.body_markdown, n.requires_consent, n.created_at, nr.read_at, nr.consented_at
FROM notifications n
         INNER JOIN notification_recipients nr ON nr.notification_id = n.id
WHERE nr.user_id = @user_id
ORDER BY n.created_at DESC
LIMIT @limit_ OFFSET @offset_;

-- name: CountNotificationsForUser :one
SELECT COUNT(*) AS total
FROM notifications n
         INNER JOIN notification_recipients nr ON nr.notification_id = n.id
WHERE nr.user_id = @user_id;

-- name: GetUnreadNotificationCount :one
SELECT COUNT(*) AS total
FROM notification_recipients
WHERE user_id = @user_id
  AND read_at IS NULL;

-- name: MarkNotificationRead :exec
UPDATE notification_recipients
SET read_at = now()
WHERE notification_id = @notification_id
  AND user_id = @user_id
  AND read_at IS NULL;

-- name: ConsentNotification :exec
UPDATE notification_recipients
SET consented_at = now(),
    read_at       = coalesce(read_at, now())
WHERE notification_id = @notification_id
  AND user_id = @user_id;
