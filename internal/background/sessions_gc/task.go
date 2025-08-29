package sessions_gc

import (
	"context"
	"sync"
	"time"

	"github.com/rs/zerolog/log"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/storage"
)

type Task struct {
	ctx             context.Context
	stopFunc        func()
	sessionsStorage storage.SessionStorage

	once   sync.Once
	period time.Duration
}

func New(dataStorage storage.Storage) *Task {
	ctx, cancel := context.WithCancel(context.Background())

	return &Task{
		ctx:             ctx,
		stopFunc:        cancel,
		sessionsStorage: dataStorage.SessionStorage(),
		period:          time.Second * 10,
	}
}

func (t *Task) Start() {
	go t.once.Do(func() {
		err := t.do()
		if err != nil {
			log.Err(err).Msg("failed to delete expired sessions")
		}

		ticker := time.NewTicker(t.period)
		for {
			select {
			case <-t.ctx.Done():
				return
			case <-ticker.C:
				err = t.do()
				if err != nil {
					log.Err(err).Msg("failed to delete expired sessions")
				}
			}
		}
	})
}

func (t *Task) do() error {
	err := t.sessionsStorage.DeleteExpired(t.ctx)
	if err != nil {
		return rerrors.Wrap(err, "error listing expired sessions")
	}

	return nil
}

func (t *Task) Stop() {
	t.stopFunc()
}
