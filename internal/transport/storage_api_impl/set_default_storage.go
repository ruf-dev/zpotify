package storage_api_impl

import (
	"context"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) SetDefaultStorage(ctx context.Context, req *zpotify_api.SetDefaultStorage_Request) (*zpotify_api.SetDefaultStorage_Response, error) {
	storageUuid, err := uuid.Parse(req.GetId())
	if err != nil {
		return nil, rerrors.Wrap(err, "error parsing storage id")
	}

	err = impl.storageService.SetDefault(ctx, storageUuid)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return &zpotify_api.SetDefaultStorage_Response{}, nil
}
