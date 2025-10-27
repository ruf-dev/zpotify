package pg

import (
	"context"
	"database/sql"

	sq "github.com/Masterminds/squirrel"
	"go.redsock.ru/rerrors"
	"go.redsock.ru/toolbox"

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

func (s *UserStorage) ListUsers(ctx context.Context, filter domain.GetUserFilter) ([]domain.User, error) {
	filter.Limit = toolbox.Coalesce(filter.Limit, 1)

	builder := sq.Select(
		"u.tg_id",
		"u.tg_username",
		"settings.locale",
		"COALESCE(permissions.can_upload, '0')",
		"COALESCE(permissions.early_access, '0')",
		"COALESCE(permissions.can_delete, '0')",
	).
		From("users u").
		Join(`user_settings    AS settings 
		ON        u.tg_id           = settings.user_tg_id`).
		Join(`user_permissions AS permissions 
		ON        u.tg_id           = permissions.user_tg_id`).
		Offset(filter.Offset).
		Limit(filter.Limit).
		PlaceholderFormat(sq.Dollar)

	if len(filter.TgUserId) != 0 {
		builder = builder.Where(sq.Eq{"tg_id": filter.TgUserId})
	}

	if len(filter.Username) != 0 {
		builder = builder.Where(sq.Eq{"tg_username": filter.Username})
	}

	query, args, err := builder.ToSql()
	if err != nil {
		return nil, rerrors.Wrap(err, "error building query")
	}

	rows, err := s.db.QueryContext(ctx, query,
		args...)
	if err != nil {
		return nil, rerrors.Wrap(wrapPgErr(err), "error getting user from db")
	}
	defer rows.Close()

	users := make([]domain.User, 0, filter.Limit)

	for rows.Next() {
		u := domain.User{}

		err = rows.Scan(
			&u.TgId,
			&u.TgUserName,

			&u.Locale,

			&u.Permissions.CanUpload,
			&u.Permissions.EarlyAccess,
			&u.Permissions.CanDelete,
		)

		users = append(users, u)
	}

	return users, nil
}

func (s *UserStorage) WithTx(tx *sql.Tx) storage.UserStorage {
	return NewUserStorage(tx)
}
