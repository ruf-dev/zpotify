package v1

import (
	"context"
	stderrs "errors"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
)

type MediaService struct {
	fileMetaStorage storage.FileMetaStorage
	registry        storage.StorageRegistry
}

func NewMediaService(dataStorage storage.Storage, registry storage.StorageRegistry) *MediaService {
	return &MediaService{
		fileMetaStorage: dataStorage.FileMeta(),
		registry:        registry,
	}
}

func (s *MediaService) Resolve(ctx context.Context, filePath string) (domain.RemoteTarget, error) {
	meta, err := s.fileMetaStorage.GetByPath(ctx, filePath)
	if err != nil {
		if stderrs.Is(err, storage.ErrNotFound) {
			return domain.RemoteTarget{}, rerrors.Wrap(service_errors.ErrNotFound)
		}
		return domain.RemoteTarget{}, rerrors.Wrap(err, "error getting file meta by path")
	}

	if meta.StorageId == domain.LocalStorageUuid {
		return domain.RemoteTarget{}, rerrors.Wrap(service_errors.ErrNotFound)
	}

	content, err := s.registry.Get(ctx, meta.StorageId)
	if err != nil {
		return domain.RemoteTarget{}, rerrors.Wrap(err, "error resolving file storage")
	}

	target, err := content.Resolve(ctx, filePath)
	if err != nil {
		if stderrs.Is(err, storage.ErrNotRemote) {
			return domain.RemoteTarget{}, rerrors.Wrap(service_errors.ErrNotFound)
		}
		return domain.RemoteTarget{}, rerrors.Wrap(err, "error resolving remote target")
	}

	return target, nil
}
