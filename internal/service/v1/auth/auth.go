package auth

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"strconv"
	"time"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
	"go.redsock.ru/rerrors"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc/codes"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
	"go.zpotify.ru/zpotify/internal/user_errors"
)

type Service struct {
	telegramIdentityStorage storage.TelegramIdentityStorage
	zpotifyIdentityStorage  storage.ZpotifyIdentityStorage
	sessionStorage          storage.SessionStorage
	userStorage             storage.UserStorage

	jwksClient keyfunc.Keyfunc

	txManager *tx_manager.TxManager

	accessTokenTTL     time.Duration
	refreshTokenTTL    time.Duration
	maxSessionsPerUser int
}

func New(data storage.Storage) (*Service, error) {
	jwks, err := keyfunc.NewDefaultCtx(context.Background(), []string{"https://oauth.telegram.org/.well-known/jwks.json"})
	if err != nil {
		return nil, rerrors.Wrap(err, "init telegram jwks client")
	}

	return &Service{
		telegramIdentityStorage: data.TelegramIdentity(),
		zpotifyIdentityStorage:  data.ZpotifyIdentity(),
		sessionStorage:          data.SessionStorage(),
		userStorage:             data.User(),

		jwksClient: jwks,

		txManager: data.TxManager(),

		accessTokenTTL:     time.Hour,
		refreshTokenTTL:    time.Hour * 24 * 7,
		maxSessionsPerUser: 3,
	}, nil
}

func (s *Service) Login(ctx context.Context, login string, password string) (domain.UserSession, error) {
	identity, err := s.zpotifyIdentityStorage.GetByLogin(ctx, login)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			return domain.UserSession{}, rerrors.Wrap(user_errors.ErrUnauthenticated, "no such user or password mismatched")
		}
		return domain.UserSession{}, rerrors.Wrap(err)
	}

	err = bcrypt.CompareHashAndPassword([]byte(identity.Password), []byte(password))
	if err != nil {
		return domain.UserSession{}, rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	session := s.generateSession(identity.UserId)

	err = s.sessionStorage.Upsert(ctx, session)
	if err != nil {
		return domain.UserSession{}, rerrors.Wrap(err)
	}

	return session, nil
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

type telegramClaims struct {
	jwt.RegisteredClaims
	Username  string `json:"username"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

func (s *Service) LoginViaTelegram(ctx context.Context, idToken string) (domain.UserSession, error) {
	claims := &telegramClaims{}
	token, err := jwt.ParseWithClaims(idToken, claims, s.jwksClient.Keyfunc,
		jwt.WithValidMethods([]string{"RS256", "ES256"}))
	if err != nil {
		return domain.UserSession{}, rerrors.Wrap(err, "parse telegram id_token")
	}

	if !token.Valid {
		return domain.UserSession{}, rerrors.New("invalid telegram token")
	}

	tgId, err := strconv.ParseInt(claims.Subject, 10, 64)
	if err != nil {
		return domain.UserSession{}, rerrors.Wrap(err, "parse telegram id from subject claim")
	}

	login := claims.Username
	if login == "" {
		login = claims.Subject
	}

	internalUserId, err := s.getOrCreateTelegramUser(ctx, tgId, login)
	if err != nil {
		return domain.UserSession{}, rerrors.Wrap(err, "get or create telegram user")
	}

	session := s.generateSession(internalUserId)

	err = s.sessionStorage.Upsert(ctx, session)
	if err != nil {
		return domain.UserSession{}, rerrors.Wrap(err, "upsert session")
	}

	return session, nil
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

	if errors.Is(err, storage.ErrNotFound) {
		newUserId, insertErr := s.userStorage.Insert(ctx, username)
		if insertErr != nil {
			return 0, rerrors.Wrap(insertErr, "insert new user for telegram login")
		}

		_, upsertErr := s.telegramIdentityStorage.Upsert(ctx, tgId, newUserId, username)
		if upsertErr != nil {
			return 0, rerrors.Wrap(upsertErr, "insert telegram identity")
		}

		return newUserId, nil
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
