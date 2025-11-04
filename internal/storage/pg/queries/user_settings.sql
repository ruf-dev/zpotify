-- name: GetHomeSegments :many
SELECT user_id,
       segment,
       type,
       order_number
FROM user_home_segments
WHERE user_id = $1
ORDER BY order_number;


-- name: GetUiSettings :one
SELECT user_tg_id,
       locale
FROM user_settings
WHERE user_tg_id = $1;