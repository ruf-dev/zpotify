package auth

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"time"

	"go.redsock.ru/rerrors"
	"google.golang.org/grpc/codes"

	"go.zpotify.ru/zpotify/internal/clients/telegram"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
	"go.zpotify.ru/zpotify/internal/user_errors"
)

type Service struct {
	tgJwkParser telegram.TokenParser

	telegramIdentityStorage storage.TelegramIdentityStorage
	zpotifyIdentityStorage  storage.ZpotifyIdentityStorage
	sessionStorage          storage.SessionStorage
	userStorage             storage.UserStorage

	txManager *tx_manager.TxManager

	accessTokenTTL     time.Duration
	refreshTokenTTL    time.Duration
	maxSessionsPerUser int
}

func New(data storage.Storage, tgJwkParser telegram.TokenParser) (*Service, error) {
	return &Service{
		tgJwkParser: tgJwkParser,

		telegramIdentityStorage: data.TelegramIdentity(),
		zpotifyIdentityStorage:  data.ZpotifyIdentity(),
		sessionStorage:          data.SessionStorage(),
		userStorage:             data.User(),

		txManager: data.TxManager(),

		accessTokenTTL:     time.Hour,
		refreshTokenTTL:    time.Hour * 24 * 7,
		maxSessionsPerUser: 3,
	}, nil
}

func (s *Service) GetMe(ctx context.Context, userId int64) (domain.User, domain.UserPermissions, error) {
	user, err := s.userStorage.GetUserById(ctx, userId)
	if err != nil {
		return domain.User{}, domain.UserPermissions{}, rerrors.Wrap(err, "error getting user")
	}

	permissions, err := s.userStorage.GetPermissions(ctx, userId)
	if err != nil {
		return domain.User{}, domain.UserPermissions{}, rerrors.Wrap(err, "error getting permissions")
	}

	return domain.User{
		UserBaseInfo: user,
		Permissions:  permissions,
	}, permissions, nil
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

func (s *Service) Logout(ctx context.Context, accessToken string) error {
	err := s.sessionStorage.Delete(ctx, accessToken)
	if err != nil {
		return rerrors.Wrap(err, "failed to delete access token")
	}

	return nil
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

func (s *Service) GetOrCreateTelegramUser(ctx context.Context, tgId int64, username string) (int64, error) {
	return s.getOrCreateTelegramUser(ctx, tgId, username)
}

func (s *Service) ResolveTelegramId(ctx context.Context, tgId int64) (int64, error) {
	identity, err := s.telegramIdentityStorage.GetByTgId(ctx, tgId)
	if err != nil {
		return 0, rerrors.Wrap(err, "resolve telegram id to internal user id")
	}
	return identity.UserId, nil
}

func (s *Service) ListAuthMethods(ctx context.Context) error {
	return rerrors.New("not implemented", codes.Unimplemented)
}

func (s *Service) getOrCreateTelegramUser(ctx context.Context, tgId int64, username string) (int64, error) {
	existing, err := s.telegramIdentityStorage.GetByTgId(ctx, tgId)
	if err != nil && !errors.Is(err, storage.ErrNotFound) {
		return 0, rerrors.Wrap(err, "get telegram identity")
	}

	_, upsertErr := s.telegramIdentityStorage.Upsert(ctx, tgId, existing.UserId, username)
	if upsertErr != nil {
		return 0, rerrors.Wrap(upsertErr, "update telegram identity last_logged_at")
	}

	return existing.UserId, nil
}

func generateToken() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return hex.EncodeToString(b)
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
