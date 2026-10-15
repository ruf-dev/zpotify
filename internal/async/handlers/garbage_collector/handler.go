package garbage_collector

import (
	"context"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

type Handler struct {
	registry storage.StorageRegistry
}

func New(registry storage.StorageRegistry) *Handler {
	return &Handler{registry: registry}
}

func (h *Handler) Handle(ctx context.Context, payload storage.GarbageFilePayload) error {
	storageId, err := resolveStorageId(payload.StorageId)
	if err != nil {
		return rerrors.Wrap(err, "parse storage id")
	}

	content, err := h.registry.Get(ctx, storageId)
	if err != nil {
		return rerrors.Wrap(err, "resolve storage")
	}

	err = content.Delete(ctx, payload.FilePath)
	if err != nil {
		return rerrors.Wrap(err, "delete file")
	}
	return nil
}

func resolveStorageId(raw string) (uuid.UUID, error) {
	if raw == "" {
		return domain.LocalStorageUuid, nil
	}

	storageId, err := uuid.Parse(raw)
	if err != nil {
		return uuid.Nil, rerrors.Wrap(err)
	}
	if storageId == uuid.Nil {
		return domain.LocalStorageUuid, nil
	}

	return storageId, nil
}
