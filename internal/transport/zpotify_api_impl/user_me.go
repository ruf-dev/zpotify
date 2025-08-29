package zpotify_api_impl

import (
	"context"

	errors "go.redsock.ru/rerrors"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"go.zpotify.ru/zpotify/internal/middleware"
	"go.zpotify.ru/zpotify/pkg/zpotify_api"
)

func (impl *Impl) Me(ctx context.Context, _ *zpotify_api.Me_Request) (*zpotify_api.Me_Response, error) {
	uc, ok := middleware.GetUserContext(ctx)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "no user id in context")
	}

	user, err := impl.userService.Get(ctx, uc.TgUserId)
	if err != nil {
		return nil, errors.Wrap(err)
	}

	out := &zpotify_api.Me_Response{
		UserData: &zpotify_api.UserData{
			Username: user.TgUserName,
		},
	}
	return out, nil
}
