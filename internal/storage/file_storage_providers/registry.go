package file_storage_providers

import (
	"context"
	"sync"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/file_storage_providers/gdrive"
	"go.zpotify.ru/zpotify/internal/storage/file_storage_providers/s3"
	"go.zpotify.ru/zpotify/internal/storage/file_storage_providers/webdav"
	"go.zpotify.ru/zpotify/internal/storage/storage_config"
	"go.zpotify.ru/zpotify/internal/utils"
)

type Registry struct {
	storages   storage.StoragesStorage
	local      storage.ContentStorage
	secretsKey string

	mu    sync.RWMutex
	cache map[uuid.UUID]storage.ContentStorage

	newS3          func(ctx context.Context, cfg domain.S3Config) (storage.ContentStorage, error)
	newWebdav      func(cfg domain.WebdavConfig) (storage.ContentStorage, error)
	newGoogleDrive func(ctx context.Context, cfg domain.GoogleDriveConfig) (storage.ContentStorage, error)
}

func NewRegistry(storages storage.StoragesStorage, local storage.ContentStorage, secretsKey string) *Registry {
	return &Registry{
		storages:       storages,
		local:          local,
		secretsKey:     secretsKey,
		cache:          make(map[uuid.UUID]storage.ContentStorage),
		newS3:          s3.New,
		newWebdav:      webdav.New,
		newGoogleDrive: gdrive.New,
	}
}

func (r *Registry) Get(ctx context.Context, storageId uuid.UUID) (storage.ContentStorage, error) {
	if storageId == domain.LocalStorageUuid {
		return r.local, nil
	}

	r.mu.RLock()
	cached, ok := r.cache[storageId]
	r.mu.RUnlock()
	if ok {
		return cached, nil
	}

	row, err := r.storages.Get(ctx, storageId)
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting storage row")
	}
	if !row.Valid {
		return nil, rerrors.Wrap(service_errors.ErrStorageNotFound)
	}

	return r.build(ctx, row.V)
}

func (r *Registry) Default(ctx context.Context) (uuid.UUID, storage.ContentStorage, error) {
	row, err := r.storages.GetDefault(ctx)
	if err != nil {
		return uuid.Nil, nil, rerrors.Wrap(err, "error getting default storage row")
	}

	content, err := r.Get(ctx, row.Uuid)
	if err != nil {
		return uuid.Nil, nil, rerrors.Wrap(err, "error resolving default storage")
	}

	return row.Uuid, content, nil
}

func (r *Registry) Invalidate(storageId uuid.UUID) {
	r.mu.Lock()
	delete(r.cache, storageId)
	r.mu.Unlock()
}

func (r *Registry) build(ctx context.Context, row storage.StorageRow) (storage.ContentStorage, error) {
	cfg, err := storage_config.Decode(r.secretsKey, row.ConfigEnc)
	if err != nil {
		return nil, rerrors.Wrap(err, "error decoding storage config")
	}

	content, err := r.construct(ctx, row.Kind, cfg)
	if err != nil {
		return nil, rerrors.Wrap(err, "error constructing storage provider")
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	existing, ok := r.cache[row.Uuid]
	if ok {
		return existing, nil
	}
	r.cache[row.Uuid] = content

	return content, nil
}

func (r *Registry) construct(
	ctx context.Context,
	kind domain.StorageKind,
	cfg domain.StorageConfig,
) (storage.ContentStorage, error) {
	switch kind {
	case domain.StorageKindS3:
		if cfg.S3 == nil {
			return nil, rerrors.Wrap(service_errors.ErrStorageInvalidConfig)
		}

		return r.newS3(ctx, *cfg.S3)
	case domain.StorageKindWebdav:
		if cfg.Webdav == nil {
			return nil, rerrors.Wrap(service_errors.ErrStorageInvalidConfig)
		}

		return r.newWebdav(*cfg.Webdav)
	case domain.StorageKindGoogleDrive:
		if cfg.GoogleDrive == nil {
			return nil, rerrors.Wrap(service_errors.ErrStorageInvalidConfig)
		}

		return r.newGoogleDrive(ctx, *cfg.GoogleDrive)
	default:
		return nil, rerrors.Wrap(service_errors.ErrStorageInvalidConfig)
	}
}

func (r *Registry) Transfer(
	ctx context.Context,
	fromId uuid.UUID,
	fromPath string,
	toId uuid.UUID,
	toPath string,
) error {
	from, err := r.Get(ctx, fromId)
	if err != nil {
		return rerrors.Wrap(err, "error resolving source storage")
	}

	if fromId == toId {
		err = from.Copy(ctx, fromPath, toPath)
		if err != nil {
			return rerrors.Wrap(err, "error copying within storage")
		}

		return nil
	}

	to, err := r.Get(ctx, toId)
	if err != nil {
		return rerrors.Wrap(err, "error resolving destination storage")
	}

	content, err := from.Get(ctx, fromPath)
	if err != nil {
		return rerrors.Wrap(err, "error reading source file")
	}
	defer utils.CloseWithLog(content, "source content in Registry.Transfer")

	err = to.Put(ctx, toPath, content)
	if err != nil {
		return rerrors.Wrap(err, "error writing destination file")
	}

	return nil
}
