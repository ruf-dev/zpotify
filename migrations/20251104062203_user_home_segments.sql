-- +goose Up
-- +goose StatementBegin

CREATE TYPE user_home_segment_type AS ENUM ('playlist');

CREATE TABLE user_home_segments
(
    user_id      BIGINT REFERENCES users (tg_id) NOT NULL,
    segment      JSON                            NOT NULL,
    type         user_home_segment_type          NOT NULL,
    order_number INT                             NOT NULL,
    PRIMARY KEY (user_id, order_number)
);

INSERT INTO user_home_segments
    (user_id, segment, type, order_number)
SELECT tg_id, '{"playlist": "3a608e96-38ae-470c-83f2-842fc4a70ed2"}', 'playlist', 1
FROM users;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- +goose StatementEnd
