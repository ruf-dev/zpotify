-- +goose Up
-- +goose StatementBegin
CREATE TABLE notifications
(
    id               INT8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title            TEXT        NOT NULL,
    body_markdown    TEXT        NOT NULL,
    requires_consent BOOLEAN     NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notification_recipients
(
    notification_id INT8 REFERENCES notifications (id) ON DELETE CASCADE NOT NULL,
    user_id         INT8 REFERENCES users (id) ON DELETE CASCADE         NOT NULL,
    read_at         TIMESTAMPTZ,
    consented_at    TIMESTAMPTZ,
    PRIMARY KEY (notification_id, user_id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE notification_recipients;
DROP TABLE notifications;
-- +goose StatementEnd
