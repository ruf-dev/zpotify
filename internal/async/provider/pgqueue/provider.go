package pgqueue

import (
	"context"
	"encoding/json"
	"sync"
	"time"

	"github.com/lib/pq"
	"github.com/rs/zerolog/log"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/utils"
)

type HandleFunc[T any] func(ctx context.Context, payload T) error

type Provider[T any] struct {
	ctx       context.Context
	stop      func()
	jobs      storage.JobStorage
	queueName string
	handle    HandleFunc[T]
	period    time.Duration
	listener  *pq.Listener
	once      sync.Once
}

func New[T any](
	connStr string,
	jobs storage.JobStorage,
	queueName string,
	handle HandleFunc[T],
	period time.Duration,
) *Provider[T] {
	ctx, cancel := context.WithCancel(context.Background())
	listener := pq.NewListener(connStr, 10*time.Second, time.Minute, func(_ pq.ListenerEventType, err error) {
		if err != nil {
			log.Err(err).Str("queue", queueName).Msg("pgqueue: listener event")
		}
	})
	return &Provider[T]{
		ctx:       ctx,
		stop:      cancel,
		jobs:      jobs,
		queueName: queueName,
		handle:    handle,
		period:    period,
		listener:  listener,
	}
}

func (p *Provider[T]) Start() {
	go p.once.Do(func() {
		err := p.listener.Listen("pgqueue_" + p.queueName)
		if err != nil {
			log.Err(rerrors.Wrap(err)).Str("queue", p.queueName).Msg("pgqueue: failed to listen")
		}

		p.poll()

		ticker := time.NewTicker(p.period)
		defer ticker.Stop()
		for {
			select {
			case <-p.ctx.Done():
				return
			case <-p.listener.NotificationChannel():
				p.poll()
			case <-ticker.C:
				p.requeueStalled()
				p.poll()
			}
		}
	})
}

func (p *Provider[T]) Stop() {
	p.stop()
	utils.CloseWithLog(p.listener, "pgqueue listener")
}

func (p *Provider[T]) requeueStalled() {
	err := p.jobs.RequeueStalled(p.ctx)
	if err != nil {
		log.Err(rerrors.Wrap(err)).Str("queue", p.queueName).Msg("pgqueue: requeue stalled failed")
	}
}

func (p *Provider[T]) poll() {
	jobs, err := p.jobs.Claim(p.ctx, p.queueName, 10)
	if err != nil {
		log.Err(rerrors.Wrap(err)).Str("queue", p.queueName).Msg("pgqueue: claim failed")
		return
	}
	for _, job := range jobs {
		p.processJob(job)
	}
}

func (p *Provider[T]) processJob(job storage.Job) {
	var payload T
	err := json.Unmarshal(job.Payload, &payload)
	if err != nil {
		log.Err(rerrors.Wrap(err)).Int64("job_id", job.ID).Msg("pgqueue: failed to unmarshal payload")
		failErr := p.jobs.Fail(p.ctx, job.ID, err.Error(), backoff(job.Attempts))
		if failErr != nil {
			log.Err(rerrors.Wrap(failErr)).Int64("job_id", job.ID).Msg("pgqueue: failed to record unmarshal error")
		}
		return
	}

	err = p.handle(p.ctx, payload)
	if err != nil {
		log.Err(rerrors.Wrap(err)).Int64("job_id", job.ID).Msg("pgqueue: handler error")
		failErr := p.jobs.Fail(p.ctx, job.ID, err.Error(), backoff(job.Attempts))
		if failErr != nil {
			log.Err(rerrors.Wrap(failErr)).Int64("job_id", job.ID).Msg("pgqueue: failed to record handler error")
		}
		return
	}

	completeErr := p.jobs.Complete(p.ctx, job.ID)
	if completeErr != nil {
		log.Err(rerrors.Wrap(completeErr)).Int64("job_id", job.ID).Msg("pgqueue: failed to mark job completed")
	}
}

func backoff(attempts int32) int32 {
	v := attempts * attempts * 30
	if v > 3600 {
		return 3600
	}
	return v
}
