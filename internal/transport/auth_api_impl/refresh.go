package auth_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	pb "go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) RefreshToken(ctx context.Context, r *pb.Refresh_Request) (*pb.Refresh_Response, error) {
	session, err := impl.authService.Refresh(ctx, r.GetRefreshToken())
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return &pb.Refresh_Response{
		AuthData: toAuthData(session),
	}, nil
}