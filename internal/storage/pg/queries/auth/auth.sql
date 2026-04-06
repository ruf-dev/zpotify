-- name: CreateUserIdentity :exec
INSERT INTO user_identities
    (user_id, identity_provider, payload)
VALUES ($1, $2, $3);


-- name: GetIdentitiesByUsernameAndProvider :one
SELECT user_identities.id,
       user_identities.user_id,
       user_identities.identity_provider,
       user_identities.payload
FROM user_identities
         JOIN users
              ON user_identities.user_id = users.id
WHERE users.username = $1
  AND user_identities.identity_provider = $2;