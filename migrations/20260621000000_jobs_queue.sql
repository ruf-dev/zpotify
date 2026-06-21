-- +goose Up
-- +goose StatementBegin
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE jobs (
    id               BIGSERIAL    PRIMARY KEY,
    queue_name       TEXT         NOT NULL,
    payload          JSONB        NOT NULL DEFAULT '{}',
    status           job_status   NOT NULL DEFAULT 'pending',
    attempts         INT          NOT NULL DEFAULT 0,
    max_attempts     INT          NOT NULL DEFAULT 3,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    scheduled_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    processing_until TIMESTAMPTZ,
    last_error       TEXT
);

CREATE INDEX idx_jobs_claim ON jobs (queue_name, scheduled_at)
    WHERE status = 'pending';

CREATE OR REPLACE FUNCTION notify_new_job() RETURNS trigger AS $$
BEGIN
    PERFORM pg_notify('pgqueue_' || NEW.queue_name, '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_jobs_notify
    AFTER INSERT ON jobs
    FOR EACH ROW EXECUTE FUNCTION notify_new_job();

INSERT INTO jobs (queue_name, payload, created_at, scheduled_at)
SELECT 'garbage_collector',
       jsonb_build_object('file_path', file_path),
       added_at,
       added_at
FROM garbage_collector
WHERE deleted_at IS NULL;

DROP TABLE garbage_collector;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_jobs_notify ON jobs;
DROP FUNCTION IF EXISTS notify_new_job();

CREATE TABLE garbage_collector (
    id         BIGSERIAL   PRIMARY KEY,
    file_path  TEXT        NOT NULL,
    added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

INSERT INTO garbage_collector (file_path, added_at)
SELECT payload->>'file_path', created_at
FROM jobs
WHERE queue_name = 'garbage_collector'
  AND status IN ('pending', 'processing');

DROP TABLE jobs;
DROP TYPE job_status;
-- +goose StatementEnd
