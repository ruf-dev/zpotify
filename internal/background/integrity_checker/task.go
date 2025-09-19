package integrity_checker

import (
	"context"
	"sync"
	"time"

	"github.com/rs/zerolog/log"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/telegram"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

type Task struct {
	ctx      context.Context
	stopFunc func()

	fileMetaStorage storage.FileMetaStorage
	tgApi           telegram.TgApiClient

	once   sync.Once
	period time.Duration
}

func New(tgApi telegram.TgApiClient, dataStorage storage.Storage) *Task {
	ctx, cancel := context.WithCancel(context.Background())

	return &Task{
		ctx:      ctx,
		stopFunc: cancel,

		fileMetaStorage: dataStorage.FileMeta(),
		tgApi:           tgApi,

		period: time.Second * 10,
	}
}

func (t *Task) Start() {
	go t.once.Do(func() {
		err := t.do()
		if err != nil {
			log.Err(err).
				Msg("failed to delete expired sessions")
		}

		ticker := time.NewTicker(t.period)
		for {
			select {
			case <-t.ctx.Done():
				return
			case <-ticker.C:
				err = t.do()
				if err != nil {
					log.Err(err).
						Msg("failed to delete expired sessions")
				}
			}
		}
	})
}

func (t *Task) do() error {
	listReq := domain.ListFileMeta{
		NoSizeBytesFilter: true,
		Offset:            0,
		Limit:             100,
	}

	list, err := t.fileMetaStorage.List(t.ctx, listReq)
	if err != nil {
		return rerrors.Wrap(err, "error listing files without size")
	}

	for _, l := range list {
		if l.SizeBytes != 0 {
			//	Double check never hearts
			continue
		}

		f, err := t.tgApi.GetFile(t.ctx, l.TgFile.FileId)
		if err != nil {
			return rerrors.Wrap(err, "error opening file")
		}

		l.SizeBytes = int64(f.FileSize)

		err = t.fileMetaStorage.Upsert(t.ctx, l)
		if err != nil {
			return rerrors.Wrap(err, "error upserting file")
		}
	}

	return nil
}

func (t *Task) Stop() {
	t.stopFunc()
}
