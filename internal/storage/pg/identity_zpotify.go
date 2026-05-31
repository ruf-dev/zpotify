package pg

import (
	"context"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	querier "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

type ZpotifyIdentityStorage struct {
	q querier.Querier
}

func NewZpotifyIdentityStorage(db sqldb.DB) *ZpotifyIdentityStorage {
	return &ZpotifyIdentityStorage{q: querier.New(db)}
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
