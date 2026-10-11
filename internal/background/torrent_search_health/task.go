package torrent_search_health

import (
	"context"
	"sync"
	"time"

	"go.zpotify.ru/zpotify/internal/log"
)

type HealthChecker interface {
	CheckHealth(ctx context.Context) error
}

const period = time.Minute

type Task struct {
	ctx      context.Context
	stopFunc func()

	checker HealthChecker
	once    sync.Once
}

func New(checker HealthChecker) *Task {
	ctx, cancel := context.WithCancel(context.Background())

	return &Task{
		ctx:      ctx,
		stopFunc: cancel,
		checker:  checker,
	}
}

func (t *Task) Start() {
	go t.once.Do(t.run)
}

func (t *Task) Stop() {
	t.stopFunc()
}

func (t *Task) run() {
	t.check()

	ticker := time.NewTicker(period)
	for {
		select {
		case <-t.ctx.Done():
			ticker.Stop()
			return
		case <-ticker.C:
			t.check()
		}
	}
}

func (t *Task) check() {
	err := t.checker.CheckHealth(t.ctx)
	if err != nil {
		log.Warn(t.ctx).Err(err).Msg("torrent search indexer is unreachable")
	}
}
