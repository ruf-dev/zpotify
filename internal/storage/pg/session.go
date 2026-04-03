package pg

import (
	"context"
	"database/sql"

	"github.com/lib/pq"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	querier "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

type SessionStorage struct {
	db sqldb.DB
	q  querier.Querier
}

func NewSessionStorage(db sqldb.DB) *SessionStorage {
	return &SessionStorage{
		db: db,
		q:  querier.New(db),
	}
}

func (s *SessionStorage) GetByAccessToken(ctx context.Context, accessToken string) (domain.UserSession, error) {
	userSession, err := s.q.GetUserSessionByAccessToken(ctx, accessToken)
	if err != nil {
		return domain.UserSession{}, wrapPgErr(err)
	}

	return toDomainUserSession(userSession), nil
}

func (s *SessionStorage) GetByRefreshToken(ctx context.Context, refreshToken string) (domain.UserSession, error) {
	userSessionDb, err := s.q.GetUserSessionByRefreshToken(ctx, refreshToken)
	if err != nil {
		return domain.UserSession{}, wrapPgErr(err)
	}

	return toDomainUserSession(userSessionDb), nil
}

func (s *SessionStorage) Upsert(ctx context.Context, session domain.UserSession) error {
	// TODO think about session update
	_, err := s.db.ExecContext(ctx, `
			INSERT INTO user_sessions 
					(user_id, access_token, refresh_token, access_expire_at, refresh_expire_at)
			VALUES	($1, $2, $3, $4, $5)
	`, session.UserId,
		session.AccessToken, session.RefreshToken,
		session.AccessExpiresAt.UTC(), session.RefreshExpiresAt.UTC())
	if err != nil {
		return rerrors.Wrap(err, "error upserting user session")
	}

	return nil
}

func (s *SessionStorage) Delete(ctx context.Context, tokens ...string) error {
	_, err := s.db.ExecContext(ctx, `DELETE FROM user_sessions WHERE access_token = ANY($1)`, pq.Array(tokens))
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (s *SessionStorage) ListByUserId(ctx context.Context, tgId int64) ([]domain.UserSession, error) {
	sessionDb, err := s.q.ListSessionsByUserId(ctx, int16(tgId))
	if err != nil {
		return nil, wrapPgErr(err)
	}

	out := make([]domain.UserSession, 0, len(sessionDb))
	for _, session := range sessionDb {
		out = append(out, toDomainUserSession(session))
	}

	return out, nil
}

func (s *SessionStorage) DeleteExpired(ctx context.Context) error {
	err := s.q.DeleteExpiredSessions(ctx)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (s *SessionStorage) WithTx(tx *sql.Tx) storage.SessionStorage {
	return NewSessionStorage(tx)
}

func toDomainUserSession(s querier.UserSession) domain.UserSession {
	return domain.UserSession{
		UserId:           int64(s.UserID),
		AccessToken:      s.AccessToken,
		AccessExpiresAt:  s.AccessExpireAt,
		RefreshToken:     s.RefreshToken,
		RefreshExpiresAt: s.RefreshExpireAt,
	}
}
