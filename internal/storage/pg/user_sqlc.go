package pg

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	querier "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

func (s *UserStorage) Upsert(ctx context.Context, username string) error {
	err := s.querier.UpsertUser(ctx, username)
	if err != nil {
		return rerrors.Wrap(wrapPgErr(err), "error upserting user")
	}

	return nil
}

func (s *UserStorage) GetUserById(ctx context.Context, userId int64) (domain.UserBaseInfo, error) {
	user, err := s.querier.GetUserById(ctx, int16(userId))
	if err != nil {
		return domain.UserBaseInfo{}, wrapPgErr(err)
	}

	return userToDomain(user), nil
}

func (s *UserStorage) SaveSettings(ctx context.Context, userId int64, settings domain.UserUiSettings) error {
	userSettingsParams := querier.SaveUserSettingsParams{
		UserID: int16(userId),
		Locale: settings.Locale,
	}

	err := s.querier.SaveUserSettings(ctx, userSettingsParams)
	if err != nil {
		return rerrors.Wrap(wrapPgErr(err), "error saving settings")
	}

	return nil
}

func (s *UserStorage) SavePermissions(ctx context.Context, userId int64, permissions domain.UserPermissions) error {
	params := querier.SaveUserPermissionsParams{
		UserID:            int16(userId),
		CanUpload:         permissions.CanUpload,
		EarlyAccess:       permissions.EarlyAccess,
		CanCreatePlaylist: permissions.CanCreatePlaylist,
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
		UserID:     int16(userTgId),
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

func userToDomain(u querier.User) domain.UserBaseInfo {
	return domain.UserBaseInfo{
		Id:       int64(u.ID),
		Username: u.Username,
	}
}
