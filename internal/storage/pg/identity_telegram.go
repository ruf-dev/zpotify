package pg

import (
	"context"
	"database/sql"
	"errors"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	querier "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

type TelegramIdentityStorage struct {
	q querier.Querier
}

func NewTelegramIdentityStorage(db sqldb.DB) *TelegramIdentityStorage {
	return &TelegramIdentityStorage{q: querier.New(db)}
}

func (s *TelegramIdentityStorage) Upsert(ctx context.Context, tgId int64, userId int64, login string) (int64, error) {
	params := querier.UpsertTelegramIdentityParams{
		TelegramID: tgId,
		UserID:     userId,
		Login:      login,
	}
	returnedUserId, err := s.q.UpsertTelegramIdentity(ctx, params)
	if err != nil {
		return 0, rerrors.Wrap(wrapPgErr(err), "upsert telegram identity")
	}
	return returnedUserId, nil
}

func (s *TelegramIdentityStorage) GetByTgId(ctx context.Context, tgId int64) (domain.TelegramIdentity, error) {
	row, err := s.q.GetTelegramIdentityByTgId(ctx, tgId)
	if err != nil {
		return domain.TelegramIdentity{}, wrapPgErr(err)
	}
	return domain.TelegramIdentity{
		TelegramId: row.TelegramID,
		UserId:     row.UserID,
		Login:      row.Login,
	}, nil
}

func (s *TelegramIdentityStorage) WithTx(tx *sql.Tx) storage.TelegramIdentityStorage {
	return NewTelegramIdentityStorage(tx)
}

func (s *TelegramIdentityStorage) GetByTgIdTx(ctx context.Context, tgId int64) (sql.Null[domain.TelegramIdentity], error) {
	row, err := s.q.GetTelegramIdentityByTgIdForUpdate(ctx, tgId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return sql.Null[domain.TelegramIdentity]{}, nil
		}
		return sql.Null[domain.TelegramIdentity]{}, wrapPgErr(err)
	}
	identity := domain.TelegramIdentity{
		TelegramId: row.TelegramID,
		UserId:     row.UserID,
		Login:      row.Login,
	}
	return sql.Null[domain.TelegramIdentity]{V: identity, Valid: true}, nil
}
