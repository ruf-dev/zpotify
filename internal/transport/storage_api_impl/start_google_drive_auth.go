package storage_api_impl

import (
	"context"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) StartGoogleDriveAuth(ctx context.Context, req *zpotify_api.StartGoogleDriveAuth_Request) (*zpotify_api.StartGoogleDriveAuth_Response, error) {
	storageUuid, err := uuid.Parse(req.GetId())
	if err != nil {
		return nil, rerrors.Wrap(err, "error parsing storage id")
	}

	consentUrl, err := impl.storageService.StartGoogleDriveAuth(ctx, storageUuid)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	resp := &zpotify_api.StartGoogleDriveAuth_Response{
		ConsentUrl: consentUrl,
	}

	return resp, nil
}
