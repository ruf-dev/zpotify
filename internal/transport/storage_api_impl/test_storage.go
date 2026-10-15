package storage_api_impl

import (
	"context"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) TestStorage(ctx context.Context, req *zpotify_api.TestStorage_Request) (*zpotify_api.TestStorage_Response, error) {
	storageUuid, err := uuid.Parse(req.GetId())
	if err != nil {
		return nil, rerrors.Wrap(err, "error parsing storage id")
	}

	err = impl.storageService.Test(ctx, storageUuid)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return &zpotify_api.TestStorage_Response{}, nil
}
