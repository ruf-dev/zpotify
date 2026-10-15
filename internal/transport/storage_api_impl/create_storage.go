package storage_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) CreateStorage(ctx context.Context, req *zpotify_api.CreateStorage_Request) (*zpotify_api.CreateStorage_Response, error) {
	createReq := domain.CreateStorage{
		Name:   req.GetName(),
		Config: toDomainStorageConfig(req.GetConfig()),
	}

	info, err := impl.storageService.Create(ctx, createReq)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	resp := &zpotify_api.CreateStorage_Response{
		Storage: toProtoStorageInfo(info),
	}

	return resp, nil
}
