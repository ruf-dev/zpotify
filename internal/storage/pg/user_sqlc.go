package pg

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	querier "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

func (s *UserStorage) Upsert(ctx context.Context, user domain.UserInfo) error {
	upsertUser := querier.UpsertUserParams{
		TgID:       user.TgId,
		TgUsername: user.TgUserName,
	}
	err := s.querier.UpsertUser(ctx, upsertUser)
	if err != nil {
		return rerrors.Wrap(wrapPgErr(err), "error upserting user")
	}

	return nil
}

func (s *UserStorage) GetUserByTgId(ctx context.Context, tgUserId int64) (domain.User, error) {
	user, err := s.querier.GetUserByTgId(ctx, tgUserId)
	if err != nil {
		return domain.User{}, wrapPgErr(err)
	}

	return userToDomain(user), nil
}

func (s *UserStorage) SaveSettings(ctx context.Context, userTgId int64, settings domain.UserUiSettings) error {
	userSettingsParams := querier.SaveUserSettingsParams{
		UserTgID: userTgId,
		Locale:   settings.Locale,
	}

	err := s.querier.SaveUserSettings(ctx, userSettingsParams)
	if err != nil {
		return rerrors.Wrap(wrapPgErr(err), "error saving settings")
	}

	return nil
}

func (s *UserStorage) SavePermissions(ctx context.Context, userTgId int64, permissions domain.UserPermissions) error {
	params := querier.SaveUserPermissionsParams{
		UserTgID:    userTgId,
		CanUpload:   permissions.CanUpload,
		EarlyAccess: permissions.EarlyAccess,
		CanDelete:   permissions.CanDelete,
	}

	err := s.querier.SaveUserPermissions(ctx, params)
	if err != nil {
		return rerrors.Wrap(err, "error saving permissions")
	}

	return nil
}

func (s *UserStorage) GetPermissionsOnPlaylist(ctx context.Context, userTgId int64, playlistUuid string) (domain.PlaylistPermissions, error) {
	playlistId, err := uuid.Parse(playlistUuid)
	if err != nil {
		return domain.PlaylistPermissions{}, rerrors.Wrap(err, "parse playlistUuid from string to uuid")
	}

	params := querier.GetUserPermissionsOnPlaylistParams{
		UserTgID:   userTgId,
		PlaylistID: playlistId,
	}
	res, err := s.querier.GetUserPermissionsOnPlaylist(ctx, params)
	if err != nil {
		if rerrors.Is(err, sql.ErrNoRows) {
			return domain.PlaylistPermissions{}, nil
		}

		return domain.PlaylistPermissions{}, rerrors.Wrap(err, "executing GetUserPermissionsOnPlaylist custom query")
	}

	return domain.PlaylistPermissions{
		CanDeleteSongs: res.CanDeleteSongs,
		CanAddSongs:    res.CanAddSongs,
	}, nil
}
