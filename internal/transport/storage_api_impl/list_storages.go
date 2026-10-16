package storage_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) ListStorages(ctx context.Context, _ *zpotify_api.ListStorages_Request) (*zpotify_api.ListStorages_Response, error) {
	storages, err := impl.storageService.List(ctx)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	protoStorages := make([]*zpotify_api.StorageInfo, 0, len(storages))
	for _, info := range storages {
		protoStorages = append(protoStorages, toProtoStorageInfo(info))
	}

	resp := &zpotify_api.ListStorages_Response{
		Storages:               protoStorages,
		IsSecretsKeyConfigured: impl.storageService.IsSecretsKeyConfigured(),
	}

	return resp, nil
}
