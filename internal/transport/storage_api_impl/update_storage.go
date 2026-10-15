package storage_api_impl

import (
	"context"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) UpdateStorage(ctx context.Context, req *zpotify_api.UpdateStorage_Request) (*zpotify_api.UpdateStorage_Response, error) {
	storageUuid, err := uuid.Parse(req.GetId())
	if err != nil {
		return nil, rerrors.Wrap(err, "error parsing storage id")
	}

	updateReq := domain.UpdateStorage{
		Uuid:   storageUuid,
		Name:   req.GetName(),
		Config: toDomainStorageConfig(req.GetConfig()),
	}

	err = impl.storageService.Update(ctx, updateReq)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return &zpotify_api.UpdateStorage_Response{}, nil
}
