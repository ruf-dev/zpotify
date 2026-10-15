package file_storage_providers

import (
	"context"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/utils"
)

type Registry struct {
	storages   storage.StoragesStorage
	local      storage.ContentStorage
	secretsKey string
}

func NewRegistry(storages storage.StoragesStorage, local storage.ContentStorage, secretsKey string) *Registry {
	return &Registry{
		storages:   storages,
		local:      local,
		secretsKey: secretsKey,
	}
}

func (r *Registry) Get(_ context.Context, storageId uuid.UUID) (storage.ContentStorage, error) {
	if storageId == domain.LocalStorageUuid {
		return r.local, nil
	}

	return nil, rerrors.Wrap(service_errors.ErrNotImplemented)
}

func (r *Registry) Default(_ context.Context) (uuid.UUID, storage.ContentStorage, error) {
	return domain.LocalStorageUuid, r.local, nil
}

func (r *Registry) Invalidate(_ uuid.UUID) {}

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
