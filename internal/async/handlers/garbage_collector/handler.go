package garbage_collector

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/storage"
)

type Handler struct {
	fs storage.BinaryFileStorage
}

func New(fs storage.BinaryFileStorage) *Handler {
	return &Handler{fs: fs}
}

func (h *Handler) Handle(ctx context.Context, payload storage.GarbageFilePayload) error {
	err := h.fs.Delete(ctx, payload.FilePath)
	if err != nil {
		return rerrors.Wrap(err, "delete file")
	}
	return nil
}
