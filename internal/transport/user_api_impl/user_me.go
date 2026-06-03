package user_api_impl

import (
	"context"
	"database/sql"

	errors "go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) Me(ctx context.Context, _ *zpotify_api.Me_Request) (*zpotify_api.Me_Response, error) {
	user, err := impl.userService.GetMe(ctx)
	if err != nil {
		return nil, errors.Wrap(err)
	}

	userData := &zpotify_api.UserData{
		Username:   user.Username,
		PictureUrl: nullStringPtr(user.PhotoUrl),
	}
	out := &zpotify_api.Me_Response{
		UserData:    userData,
		Permissions: toPbPermissions(user.Permissions),
	}
	return out, nil
}

func nullStringPtr(v sql.Null[string]) *string {
	if !v.Valid {
		return nil
	}
	return &v.V
}

func toPbPermissions(permissions domain.UserPermissions) *zpotify_api.Permissions {
	return &zpotify_api.Permissions{
		CanUpload:         permissions.CanUpload,
		EarlyAccess:       permissions.EarlyAccess,
		CanCreatePlaylist: permissions.CanCreatePlaylist,
	}
}
