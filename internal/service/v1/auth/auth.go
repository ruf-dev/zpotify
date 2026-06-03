package auth

import (
	"context"
	"time"

	"go.redsock.ru/rerrors"
	"google.golang.org/grpc/codes"

	"go.zpotify.ru/zpotify/internal/clients/telegram"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
)

type Service struct {
	tgJwkParser telegram.TokenParser

	telegramIdentityStorage storage.TelegramIdentityStorage
	zpotifyIdentityStorage  storage.ZpotifyIdentityStorage
	sessionStorage          storage.SessionStorage
	userStorage             storage.UserStorage
	settingsStorage         storage.UserSettingsStorage

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
		settingsStorage:         data.UserSettings(),

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

func (s *Service) Logout(ctx context.Context, accessToken string) error {
	err := s.sessionStorage.Delete(ctx, accessToken)
	if err != nil {
		return rerrors.Wrap(err, "failed to delete access token")
	}

	return nil
}

func (s *Service) GetOrCreateTelegramUser(ctx context.Context, tgId int64, username string) (int64, error) {
	//TODO remove
	return 0, nil
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
