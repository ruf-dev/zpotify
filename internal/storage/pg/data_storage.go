package pg

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
)

type UserStorage struct {
	db sqldb.DB
}

func NewUserStorage(db sqldb.DB) *UserStorage {
	return &UserStorage{
		db: db,
	}
}

func (s *UserStorage) Upsert(ctx context.Context, user domain.User) error {
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO users
				(tg_id, tg_username) 
		VALUES  (   $1,          $2)`,
		user.TgId, user.TgUserName,
	)
	if err != nil {
		return rerrors.Wrap(err, "error upserting user")
	}

	return nil
}
