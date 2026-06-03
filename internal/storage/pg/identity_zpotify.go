package pg

import (
	"context"
	"database/sql"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	querier "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

type ZpotifyIdentityStorage struct {
	q querier.Querier
}

func (s *ZpotifyIdentityStorage) GetByLogoPass(ctx context.Context, login string, password string) (domain.ZpotifyIdentity, error) {
	//TODO
	return domain.ZpotifyIdentity{}, nil
}

func NewZpotifyIdentityStorage(db sqldb.DB) *ZpotifyIdentityStorage {
	return &ZpotifyIdentityStorage{q: querier.New(db)}
}

func (s *ZpotifyIdentityStorage) WithTx(tx *sql.Tx) storage.ZpotifyIdentityStorage {
	return &ZpotifyIdentityStorage{q: querier.New(tx)}
}

func (s *ZpotifyIdentityStorage) GetByLogin(ctx context.Context, login string) (domain.ZpotifyIdentity, error) {
	row, err := s.q.GetZpotifyIdentityByLogin(ctx, login)
	if err != nil {
		return domain.ZpotifyIdentity{}, wrapPgErr(err)
	}
	return domain.ZpotifyIdentity{
		UserId:   row.UserID,
		Login:    row.Login,
		Password: row.Password,
	}, nil
}
