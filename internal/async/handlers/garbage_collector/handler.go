package garbage_collector

import (
	"context"
	"database/sql"

	"github.com/rs/zerolog/log"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

type Handler struct {
	gcStorage storage.GarbageCollectorStorage
	fs        storage.BinaryFileStorage
}

func New(gcStorage storage.GarbageCollectorStorage, fs storage.BinaryFileStorage) *Handler {
	return &Handler{
		gcStorage: gcStorage,
		fs:        fs,
	}
}

func (h *Handler) Handle(ctx context.Context, tx *sql.Tx, file domain.GarbageFile) error {
	err := h.fs.Delete(ctx, file.FilePath)
	if err != nil {
		log.Warn().Err(err).Str("path", file.FilePath).Msg("garbage collector: failed to delete file")
	}

	err = h.gcStorage.WithTx(tx).MarkDeleted(ctx, file.Id)
	return rerrors.Wrap(err)
}
