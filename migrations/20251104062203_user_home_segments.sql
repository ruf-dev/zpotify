-- +goose Up
-- +goose StatementBegin

CREATE TYPE user_home_segment_type AS ENUM ('playlist');

CREATE TABLE user_home_segments
(
    user_id      INT8 REFERENCES users (id) NOT NULL,
    segment      JSON                       NOT NULL,
    type         user_home_segment_type     NOT NULL,
    order_number INT                        NOT NULL,
    PRIMARY KEY (user_id, order_number)
);

INSERT INTO user_home_segments
    (user_id, segment, type, order_number)
SELECT id,
       '{"playlist_id": "00000000-0000-0000-0000-000000000000"}',
       'playlist',
       1
FROM users;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- +goose StatementEnd
