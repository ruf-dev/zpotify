package pg

import (
	"context"
	"database/sql"

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

func (s *UserStorage) GetPermissions(ctx context.Context, id int64) (domain.UserPermissions, error) {
	permissions, err := s.querier.ListUserPermissionsByUserId(ctx, int16(id))
	if err != nil {
		return domain.UserPermissions{}, wrapPgErr(err)
	}

	return toDomainUserPermissions(permissions), nil
}

func (s *UserStorage) ListUsers(ctx context.Context, filter domain.GetUserFilter) ([]domain.User, error) {
	// TODO
	//filter.Limit = toolbox.Coalesce(filter.Limit, 1)
	//
	//builder := sq.Select(
	//	"tg_id",
	//	"tg_username",
	//	"locale",
	//	"can_upload",
	//	"early_access",
	//	"can_delete",
	//	"can_create_playlist",
	//).
	//	From("users_full").
	//	Offset(filter.Offset).
	//	Limit(filter.Limit).
	//	PlaceholderFormat(sq.Dollar)
	//
	//if len(filter.UserId) != 0 {
	//	builder = builder.Where(sq.Eq{"tg_id": filter.UserId})
	//}
	//
	//if len(filter.Username) != 0 {
	//	builder = builder.Where(sq.Eq{"tg_username": filter.Username})
	//}
	//
	//query, args, err := builder.ToSql()
	//if err != nil {
	//	return nil, rerrors.Wrap(err, "error building query")
	//}
	//
	//rows, err := s.db.QueryContext(ctx, query,
	//	args...)
	//if err != nil {
	//	return nil, rerrors.Wrap(wrapPgErr(err), "error getting user from db")
	//}
	//defer rows.Close()
	//
	users := make([]domain.User, 0, filter.Limit)
	//
	//for rows.Next() {
	//	u := domain.User{}
	//
	//	err = rows.Scan(
	//		&u.Id,
	//		&u.Username,
	//
	//		&u.Locale,
	//
	//		&u.Permissions.CanUpload,
	//		&u.Permissions.EarlyAccess,
	//		&u.Permissions.CanCreatePlaylist,
	//	)
	//
	//	users = append(users, u)
	//}

	return users, nil
}

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
