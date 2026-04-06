package pg

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	querier "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

type UserStorage struct {
	db sqldb.DB

	querier querier.Querier
}

func NewUserStorage(db sqldb.DB) *UserStorage {
	return &UserStorage{
		db:      db,
		querier: querier.New(db),
	}
}

func (s *UserStorage) GetUserById(ctx context.Context, userId int64) (domain.UserBaseInfo, error) {
	user, err := s.querier.GetUserById(ctx, int16(userId))
	if err != nil {
		return domain.UserBaseInfo{}, wrapPgErr(err)
	}

	return userToDomain(user), nil
}

func (s *UserStorage) GetPermissions(ctx context.Context, id int64) (domain.UserPermissions, error) {
	permissions, err := s.querier.ListUserPermissionsByUserId(ctx, int16(id))
	if err != nil {
		return domain.UserPermissions{}, wrapPgErr(err)
	}

	return toDomainUserPermissions(permissions), nil
}

func (s *UserStorage) Upsert(ctx context.Context, username string) error {
	err := s.querier.UpsertUser(ctx, username)
	if err != nil {
		return rerrors.Wrap(wrapPgErr(err), "error upserting user")
	}

	return nil
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

//func (s *UserStorage) ListUsers(ctx context.Context, filter domain.GetUserFilter) ([]domain.User, error) {
//	// TODO
//	//filter.Limit = toolbox.Coalesce(filter.Limit, 1)
//	//
//	//builder := sq.Select(
//	//	"tg_id",
//	//	"tg_username",
//	//	"locale",
//	//	"can_upload",
//	//	"early_access",
//	//	"can_delete",
//	//	"can_create_playlist",
//	//).
//	//	From("users_full").
//	//	Offset(filter.Offset).
//	//	Limit(filter.Limit).
//	//	PlaceholderFormat(sq.Dollar)
//	//
//	//if len(filter.UserId) != 0 {
//	//	builder = builder.Where(sq.Eq{"tg_id": filter.UserId})
//	//}
//	//
//	//if len(filter.Username) != 0 {
//	//	builder = builder.Where(sq.Eq{"tg_username": filter.Username})
//	//}
//	//
//	//query, args, err := builder.ToSql()
//	//if err != nil {
//	//	return nil, rerrors.Wrap(err, "error building query")
//	//}
//	//
//	//rows, err := s.db.QueryContext(ctx, query,
//	//	args...)
//	//if err != nil {
//	//	return nil, rerrors.Wrap(wrapPgErr(err), "error getting user from db")
//	//}
//	//defer rows.Close()
//	//
//	users := make([]domain.User, 0, filter.Limit)
//	//
//	//for rows.Next() {
//	//	u := domain.User{}
//	//
//	//	err = rows.Scan(
//	//		&u.Id,
//	//		&u.Username,
//	//
//	//		&u.Locale,
//	//
//	//		&u.Permissions.CanUpload,
//	//		&u.Permissions.EarlyAccess,
//	//		&u.Permissions.CanCreatePlaylist,
//	//	)
//	//
//	//	users = append(users, u)
//	//}
//
//	return users, nil
//}

func (s *UserStorage) WithTx(tx *sql.Tx) storage.UserStorage {
	return NewUserStorage(tx)
}

func toDomainUserPermissions(p querier.UserPermission) domain.UserPermissions {
	return domain.UserPermissions{
		CanUpload:         p.CanUpload,
		EarlyAccess:       p.EarlyAccess,
		CanCreatePlaylist: p.CanCreatePlaylist,
	}
}

func userToDomain(u querier.User) domain.UserBaseInfo {
	return domain.UserBaseInfo{
		Id:       int64(u.ID),
		Username: u.Username,
	}
}
