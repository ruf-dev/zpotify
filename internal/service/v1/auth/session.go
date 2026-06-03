package auth

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"time"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/user_errors"
)

func (s *Service) GetUserByToken(ctx context.Context, token string) (domain.User, error) {
	userId, err := s.ValidateToken(ctx, token)
	if err != nil {
		return domain.User{}, rerrors.Wrap(err)
	}

	user, _, err := s.GetMe(ctx, userId)
	if err != nil {
		return domain.User{}, rerrors.Wrap(err)
	}

	return user, nil
}

func (s *Service) ValidateToken(ctx context.Context, token string) (int64, error) {
	accessToken, err := s.sessionStorage.GetByAccessToken(ctx, token)
	if err != nil {
		if rerrors.Is(err, storage.ErrNotFound) {
			return 0, rerrors.Wrap(user_errors.ErrAccessTokenNotFound)
		}

		return 0, rerrors.Wrap(err, "failed to get access token")
	}

	if accessToken.AccessExpiresAt.UTC().Before(time.Now().UTC()) {
		return 0, rerrors.Wrap(user_errors.ErrAccessTokenExpired)
	}

	return accessToken.UserId, nil
}

func (s *Service) Refresh(ctx context.Context, refreshToken string) (domain.UserSession, error) {
	oldSession, err := s.sessionStorage.GetByRefreshToken(ctx, refreshToken)
	if err != nil {
		if rerrors.Is(err, storage.ErrNotFound) {
			return domain.UserSession{}, rerrors.Wrap(user_errors.ErrRefreshTokenNotFound)
		}

		return domain.UserSession{}, rerrors.Wrap(err, "failed to get access token")
	}

	if oldSession.RefreshExpiresAt.UTC().Before(time.Now().UTC()) {
		return domain.UserSession{}, rerrors.Wrap(user_errors.ErrAccessTokenExpired)
	}

	newSession := s.generateSession(oldSession.UserId)

	err = s.txManager.Execute(
		func(tx *sql.Tx) error {
			sessionStorage := s.sessionStorage.WithTx(tx)

			txErr := sessionStorage.Delete(ctx, oldSession.AccessToken)
			if txErr != nil {
				return rerrors.Wrap(txErr, "error deleting old session")
			}

			txErr = sessionStorage.Upsert(ctx, newSession)
			if txErr != nil {
				return rerrors.Wrap(err, "failed to upsert new access token")
			}

			return nil
		})
	if err != nil {
		return domain.UserSession{}, rerrors.Wrap(err, "failed to upsert new access token")
	}

	return newSession, nil
}

func (s *Service) generateSession(userId int64) domain.UserSession {
	return domain.UserSession{
		UserId:           userId,
		AccessToken:      generateToken(),
		AccessExpiresAt:  time.Now().Add(s.accessTokenTTL),
		RefreshToken:     generateToken(),
		RefreshExpiresAt: time.Now().Add(s.refreshTokenTTL),
	}
}

func generateToken() string {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		// TODO think of a better solution
		panic(err)
	}
	return hex.EncodeToString(b)
}
