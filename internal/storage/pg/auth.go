package pg

import (
	"context"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	auth_q "go.zpotify.ru/zpotify/internal/storage/pg/generated/auth"
)

type AuthStorage struct {
	db sqldb.DB
	q  auth_q.Querier
}

func NewAuthStorage(db sqldb.DB) *AuthStorage {
	return &AuthStorage{
		db: db,
		q:  auth_q.New(db),
	}
}

func (a *AuthStorage) CreateUserIdentity(ctx context.Context, params auth_q.CreateUserIdentityParams) error {
	err := a.q.CreateUserIdentity(ctx, params)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (a *AuthStorage) GetIdentitiesByUsernameAndProvider(ctx context.Context, username string, provider auth_q.IdentityProvider) (auth_q.UserIdentity, error) {
	params := auth_q.GetIdentitiesByUsernameAndProviderParams{
		Username:         username,
		IdentityProvider: provider,
	}

	resp, err := a.q.GetIdentitiesByUsernameAndProvider(ctx, params)
	if err != nil {
		return auth_q.UserIdentity{}, wrapPgErr(err)
	}

	return resp, nil
}
