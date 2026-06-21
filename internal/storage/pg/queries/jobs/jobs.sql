-- name: EnqueueJob :exec
INSERT INTO jobs (queue_name, payload, max_attempts)
VALUES ($1, $2, $3);

-- name: ClaimJobs :many
UPDATE jobs
SET status           = 'processing',
    attempts         = attempts + 1,
    processing_until = NOW() + INTERVAL '5 minutes'
WHERE id IN (
    SELECT j.id FROM jobs j
    WHERE j.queue_name    = $1
      AND j.status        = 'pending'
      AND j.scheduled_at <= NOW()
    ORDER BY j.scheduled_at
    FOR UPDATE SKIP LOCKED
    LIMIT $2
)
RETURNING id, queue_name, payload, status, attempts, max_attempts,
          created_at, scheduled_at, processing_until, last_error;

-- name: CompleteJob :exec
UPDATE jobs
SET status = 'completed', processing_until = NULL
WHERE id = $1;

-- name: FailJob :exec
UPDATE jobs
SET status           = CASE
                         WHEN attempts >= max_attempts THEN 'failed'::job_status
                         ELSE 'pending'::job_status
                       END,
    last_error       = $2,
    processing_until = NULL,
    scheduled_at     = CASE
                         WHEN attempts >= max_attempts THEN scheduled_at
                         ELSE NOW() + (($3)::int * INTERVAL '1 second')
                       END
WHERE id = $1;

-- name: RequeueStalledJobs :exec
UPDATE jobs
SET status = 'pending', processing_until = NULL
WHERE status = 'processing' AND processing_until < NOW();
