package zpotify_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/pkg/zpotify_api"
)

func (impl *Impl) RefreshToken(ctx context.Context, req *zpotify_api.Refresh_Request) (*zpotify_api.Refresh_Response, error) {
	session, err := impl.authService.Refresh(ctx, req.RefreshToken)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return &zpotify_api.Refresh_Response{
		AuthData: toAuthData(session),
	}, nil
}
