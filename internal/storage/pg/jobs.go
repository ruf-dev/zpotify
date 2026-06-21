package pg

import (
	"context"
	"database/sql"
	"encoding/json"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/jobs_q"
)

type jobsStorage struct {
	db sqldb.DB
	q  jobs_q.Querier
}

func newJobsStorage(db sqldb.DB) *jobsStorage {
	return &jobsStorage{
		db: db,
		q:  jobs_q.New(db),
	}
}

func (s *jobsStorage) WithTx(tx *sql.Tx) storage.JobStorage {
	return &jobsStorage{
		db: &txWrapper{tx},
		q:  jobs_q.New(tx),
	}
}

func (s *jobsStorage) Enqueue(ctx context.Context, queueName string, payload any, maxAttempts int32) error {
	raw, err := json.Marshal(payload)
	if err != nil {
		return rerrors.Wrap(err, "marshal payload")
	}
	params := jobs_q.EnqueueJobParams{
		QueueName:   queueName,
		Payload:     raw,
		MaxAttempts: maxAttempts,
	}
	err = s.q.EnqueueJob(ctx, params)
	if err != nil {
		return rerrors.Wrap(err, "enqueue job")
	}
	return nil
}

func (s *jobsStorage) EnqueueGarbageFile(ctx context.Context, filePath string) error {
	p := storage.GarbageFilePayload{FilePath: filePath}
	err := s.Enqueue(ctx, storage.QueueNameGarbageCollector, p, 3)
	if err != nil {
		return rerrors.Wrap(err)
	}
	return nil
}

func (s *jobsStorage) Claim(ctx context.Context, queueName string, limit int32) ([]storage.Job, error) {
	params := jobs_q.ClaimJobsParams{
		QueueName: queueName,
		Limit:     limit,
	}
	rows, err := s.q.ClaimJobs(ctx, params)
	if err != nil {
		return nil, rerrors.Wrap(err, "claim jobs")
	}
	jobs := make([]storage.Job, 0, len(rows))
	for _, row := range rows {
		job := storage.Job{
			ID:          row.ID,
			QueueName:   row.QueueName,
			Payload:     row.Payload,
			Attempts:    row.Attempts,
			MaxAttempts: row.MaxAttempts,
		}
		jobs = append(jobs, job)
	}
	return jobs, nil
}

func (s *jobsStorage) Complete(ctx context.Context, jobID int64) error {
	err := s.q.CompleteJob(ctx, jobID)
	if err != nil {
		return rerrors.Wrap(err, "complete job")
	}
	return nil
}

func (s *jobsStorage) Fail(ctx context.Context, jobID int64, lastError string, backoffSeconds int32) error {
	params := jobs_q.FailJobParams{
		ID:        jobID,
		LastError: sql.NullString{String: lastError, Valid: true},
		Column3:   backoffSeconds,
	}
	err := s.q.FailJob(ctx, params)
	if err != nil {
		return rerrors.Wrap(err, "fail job")
	}
	return nil
}

func (s *jobsStorage) RequeueStalled(ctx context.Context) error {
	err := s.q.RequeueStalledJobs(ctx)
	if err != nil {
		return rerrors.Wrap(err, "requeue stalled jobs")
	}
	return nil
}
