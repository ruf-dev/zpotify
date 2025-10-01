package zpotify_api_impl

import (
	"context"

	errors "go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/pkg/zpotify_api"
)

func (impl *Impl) Me(ctx context.Context, _ *zpotify_api.Me_Request) (*zpotify_api.Me_Response, error) {
	user, err := impl.userService.GetMe(ctx)
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
