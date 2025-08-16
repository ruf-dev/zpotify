package zpotify_api_impl

import (
	"context"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"go.zpotify.ru/zpotify/internal/middleware"
	"go.zpotify.ru/zpotify/pkg/zpotify_api"
)

func (impl *Impl) Me(ctx context.Context, _ *zpotify_api.Me_Request) (*zpotify_api.Me_Response, error) {
	tgId, ok := middleware.GetTgUserId(ctx)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id in context")
	}

	user, err := impl.userService.Get(ctx, tgId)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	out := &zpotify_api.Me_Response{
		UserData: &zpotify_api.UserData{
			Username: user.TgUserName,
		},
	}
	return out, nil
}
