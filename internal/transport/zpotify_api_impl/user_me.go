package zpotify_api_impl

import (
	"context"

	errors "go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
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
		Permissions: toPbPermissions(user.Permissions),
	}
	return out, nil
}

func toPbPermissions(permissions domain.UserPermissions) *zpotify_api.Permissions {
	return &zpotify_api.Permissions{
		CanUpload:   permissions.CanUpload,
		EarlyAccess: permissions.EarlyAccess,
		CanDelete:   permissions.CanDelete,
	}
}
