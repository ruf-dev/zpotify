-- name: GetAllFeatureFlags :many
SELECT id, is_enabled, value, comment
FROM feature_flags;
