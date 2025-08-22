package pg

import (
	"context"
	"database/sql"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

type SessionStorage struct {
	db sqldb.DB
}

func NewSessionStorage(db sqldb.DB) *SessionStorage {
	return &SessionStorage{db: db}
}

func (s *SessionStorage) GetByAccessToken(ctx context.Context, accessToken string) (domain.UserSession, error) {
	r := s.db.QueryRowContext(ctx, `
		SELECT 
			user_id,
			access_token,
			refresh_token,
			access_expire_at,
			refresh_expire_at
		FROM user_sessions
		WHERE access_token = $1
`, accessToken)

	var userSession domain.UserSession
	err := s.scanSession(r, &userSession)
	if err != nil {
		return userSession, wrapPgErr(err)
	}

	return userSession, nil
}

func (s *SessionStorage) GetByRefreshToken(ctx context.Context, refreshToken string) (domain.UserSession, error) {
	r := s.db.QueryRowContext(ctx, `
		SELECT 
			user_id,
			access_token,
			refresh_token,
			access_expire_at,
			refresh_expire_at
		FROM user_sessions
		WHERE refresh_token = $1
`, refreshToken)

	var userSession domain.UserSession
	err := s.scanSession(r, &userSession)
	if err != nil {
		return userSession, wrapPgErr(err)
	}

	return userSession, nil
}

func (s *SessionStorage) Upsert(ctx context.Context, session domain.UserSession) error {
	// TODO think about session update
	_, err := s.db.ExecContext(ctx, `
			INSERT INTO user_sessions 
					(user_id, access_token, refresh_token, access_expire_at, refresh_expire_at)
			VALUES	($1, $2, $3, $4, $5)
	`, session.UserTgId,
		session.AccessToken, session.RefreshToken,
		session.AccessExpiresAt, session.RefreshExpiresAt)
	if err != nil {
		return rerrors.Wrap(err, "error upserting user session")
	}

	return nil
}

func (s *SessionStorage) Delete(ctx context.Context, token string) error {
	//TODO implement me
	panic("implement me")
}

func (s *SessionStorage) ListByUserId(ctx context.Context, tgId int64) ([]domain.UserSession, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT 
			user_id,
			access_token,
			refresh_token,
			access_expire_at,
			refresh_expire_at
		FROM user_sessions
		WHERE user_id = $1
`, tgId)
	if err != nil {
		return nil, rerrors.Wrap(err, "error listing user's sessions")
	}
	defer rows.Close()

	sessions := make([]domain.UserSession, 0)

	for rows.Next() {
		var userSession domain.UserSession
		err = s.scanSession(rows, &userSession)
		if err != nil {
			return nil, rerrors.Wrap(err, "error scanning user session")
		}

		sessions = append(sessions, userSession)
	}

	return sessions, nil
}

func (s *SessionStorage) WithTx(tx *sql.Tx) storage.SessionStorage {
	return NewSessionStorage(tx)
}

func (s *SessionStorage) scanSession(row scanner, session *domain.UserSession) error {
	return row.Scan(
		&session.UserTgId,
		&session.AccessToken,
		&session.RefreshToken,
		&session.AccessExpiresAt,
		&session.RefreshExpiresAt,
	)
}

type scanner interface {
	Scan(dest ...interface{}) error
}
