package pgqueue

import (
	"context"
	"database/sql"
	"sync"
	"time"

	"github.com/rs/zerolog/log"
	"go.redsock.ru/rerrors"
)

type FetchFunc[T any] func(ctx context.Context, tx *sql.Tx) ([]T, error)
type HandleFunc[T any] func(ctx context.Context, tx *sql.Tx, item T) error

type Provider[T any] struct {
	ctx    context.Context
	stop   func()
	db     *sql.DB
	fetch  FetchFunc[T]
	handle HandleFunc[T]
	period time.Duration
	once   sync.Once
}

func New[T any](db *sql.DB, fetch FetchFunc[T], handle HandleFunc[T], period time.Duration) *Provider[T] {
	ctx, cancel := context.WithCancel(context.Background())
	return &Provider[T]{
		ctx:    ctx,
		stop:   cancel,
		db:     db,
		fetch:  fetch,
		handle: handle,
		period: period,
	}
}

func (p *Provider[T]) Start() {
	go p.once.Do(func() {
		p.poll()

		ticker := time.NewTicker(p.period)
		defer ticker.Stop()
		for {
			select {
			case <-p.ctx.Done():
				return
			case <-ticker.C:
				p.poll()
			}
		}
	})
}

func (p *Provider[T]) Stop() {
	p.stop()
}

func (p *Provider[T]) poll() {
	tx, err := p.db.BeginTx(p.ctx, nil)
	if err != nil {
		log.Err(rerrors.Wrap(err)).Msg("pgqueue: failed to begin transaction")
		return
	}

	items, err := p.fetch(p.ctx, tx)
	if err != nil {
		_ = tx.Rollback()
		log.Err(rerrors.Wrap(err)).Msg("pgqueue: failed to fetch items")
		return
	}

	for _, item := range items {
		err = p.handle(p.ctx, tx, item)
		if err != nil {
			log.Err(err).Msg("pgqueue: handler error")
		}
	}

	err = tx.Commit()
	if err != nil {
		log.Err(rerrors.Wrap(err)).Msg("pgqueue: failed to commit transaction")
	}
}
