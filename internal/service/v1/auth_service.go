package v1

import (
	"context"
	"database/sql"
	"errors"
	"strconv"
	"sync"
	"time"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"go.redsock.ru/rerrors"
	"google.golang.org/grpc/codes"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
	"go.zpotify.ru/zpotify/internal/user_errors"
)

type authData struct {
	outC      chan domain.UserSession
	createdAt time.Time
}

type AuthService struct {
	m sync.Map

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

func NewAuthService(data storage.Storage, telegramClientId string) (*AuthService, error) {
	jwks, err := keyfunc.NewDefaultCtx(context.Background(), []string{"https://oauth.telegram.org/.well-known/jwks.json"})
	if err != nil {
		return nil, rerrors.Wrap(err, "init telegram jwks client")
	}

	return &AuthService{
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

func (a *AuthService) AuthWithPassword(ctx context.Context, login string, password string) (domain.UserSession, error) {
	identity, err := a.zpotifyIdentityStorage.GetByLogin(ctx, login)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			return domain.UserSession{}, rerrors.Wrap(user_errors.ErrUnauthenticated, "no such user or password mismatched")
		}
		return domain.UserSession{}, rerrors.Wrap(err)
	}

	if identity.Password != password {
		return domain.UserSession{}, rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	session := a.generateSession(identity.UserId)

	err = a.sessionStorage.Upsert(ctx, session)
	if err != nil {
		return domain.UserSession{}, rerrors.Wrap(err)
	}

	return session, nil
}

func (a *AuthService) GetUserContext(ctx context.Context, id int64) (user_context.UserContext, error) {
	user, err := a.userStorage.GetUserById(ctx, id)
	if err != nil {
		return user_context.UserContext{}, rerrors.Wrap(err, "error getting user")
	}

	permissions, err := a.userStorage.GetPermissions(ctx, id)
	if err != nil {
		return user_context.UserContext{}, rerrors.Wrap(err, "error getting permissions")
	}

	return user_context.UserContext{
		UserId:      user.Id,
		Permissions: permissions,
	}, nil
}

func (a *AuthService) InitAsyncAuth() (authUuid string, doneC chan domain.UserSession) {
	authUuid = uuid.New().String()

	ad := authData{
		outC:      make(chan domain.UserSession),
		createdAt: time.Time{},
	}

	a.m.Store(authUuid, ad)

	return authUuid, ad.outC
}

func (a *AuthService) AckAsyncAuth(ctx context.Context, authUuid string, tgId int64) error {
	c, ok := a.m.LoadAndDelete(authUuid)
	if !ok {
		return nil
	}

	ad, ok := c.(authData)
	if !ok {
		return rerrors.New("failed mapping %T to authData", c)
	}

	defer close(ad.outC)

	internalUserId, err := a.ResolveTelegramId(ctx, tgId)
	if err != nil {
		return rerrors.Wrap(err, "resolve telegram id in AckAsyncAuth")
	}

	newSession := a.generateSession(internalUserId)

	err = a.txManager.Execute(func(tx *sql.Tx) error {
		sessions, err := a.sessionStorage.ListByUserId(ctx, internalUserId)
		if err != nil {
			return rerrors.Wrap(err, "error listing user's sessions")
		}

		if len(sessions) >= a.maxSessionsPerUser {
			extraTokens := make([]string, 0, len(sessions)-a.maxSessionsPerUser)
			for idx := a.maxSessionsPerUser - 1; idx < len(sessions); idx++ {
				extraTokens = append(extraTokens, sessions[idx].AccessToken)
			}

			err = a.sessionStorage.Delete(ctx, extraTokens...)
			if err != nil {
				return rerrors.Wrap(err, "error deleting oldest session")
			}
		}

		err = a.sessionStorage.Upsert(ctx, newSession)
		if err != nil {
			return rerrors.Wrap(err, "error saving new session")
		}

		return nil
	})
	if err != nil {
		return rerrors.Wrap(err)
	}

	ad.outC <- newSession

	return nil
}

func (a *AuthService) AuthWithToken(ctx context.Context, token string) (tgId int64, err error) {
	accessToken, err := a.sessionStorage.GetByAccessToken(ctx, token)
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

func (a *AuthService) Refresh(ctx context.Context, refreshToken string) (domain.UserSession, error) {
	oldSession, err := a.sessionStorage.GetByRefreshToken(ctx, refreshToken)
	if err != nil {
		if rerrors.Is(err, storage.ErrNotFound) {
			return domain.UserSession{}, rerrors.Wrap(user_errors.ErrRefreshTokenNotFound)
		}

		return domain.UserSession{}, rerrors.Wrap(err, "failed to get access token")
	}

	if oldSession.RefreshExpiresAt.UTC().Before(time.Now().UTC()) {
		return domain.UserSession{}, rerrors.Wrap(user_errors.ErrAccessTokenExpired)
	}
	newSession := a.generateSession(oldSession.UserId)

	err = a.txManager.Execute(
		func(tx *sql.Tx) error {
			sessionStorage := a.sessionStorage.WithTx(tx)

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

func (a *AuthService) AuthWithTelegramOAuth(ctx context.Context, idToken string) (domain.UserSession, error) {
	claims := &telegramClaims{}
	token, err := jwt.ParseWithClaims(idToken, claims, a.jwksClient.Keyfunc,
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

	internalUserId, err := a.getOrCreateTelegramUser(ctx, tgId, login)
	if err != nil {
		return domain.UserSession{}, rerrors.Wrap(err, "get or create telegram user")
	}

	session := a.generateSession(internalUserId)

	err = a.sessionStorage.Upsert(ctx, session)
	if err != nil {
		return domain.UserSession{}, rerrors.Wrap(err, "upsert session")
	}

	return session, nil
}

func (a *AuthService) GetOrCreateTelegramUser(ctx context.Context, tgId int64, username string) (int64, error) {
	return a.getOrCreateTelegramUser(ctx, tgId, username)
}

func (a *AuthService) ResolveTelegramId(ctx context.Context, tgId int64) (int64, error) {
	identity, err := a.telegramIdentityStorage.GetByTgId(ctx, tgId)
	if err != nil {
		return 0, rerrors.Wrap(err, "resolve telegram id to internal user id")
	}
	return identity.UserId, nil
}

func (a *AuthService) ListAuthMethods(ctx context.Context) error {
	return rerrors.New("not implemented", codes.Unimplemented)
}

func (a *AuthService) getOrCreateTelegramUser(ctx context.Context, tgId int64, username string) (int64, error) {
	existing, err := a.telegramIdentityStorage.GetByTgId(ctx, tgId)
	if err != nil && !errors.Is(err, storage.ErrNotFound) {
		return 0, rerrors.Wrap(err, "get telegram identity")
	}

	if errors.Is(err, storage.ErrNotFound) {
		newUserId, insertErr := a.userStorage.Insert(ctx, username)
		if insertErr != nil {
			return 0, rerrors.Wrap(insertErr, "insert new user for telegram login")
		}

		_, upsertErr := a.telegramIdentityStorage.Upsert(ctx, tgId, newUserId, username)
		if upsertErr != nil {
			return 0, rerrors.Wrap(upsertErr, "insert telegram identity")
		}

		return newUserId, nil
	}

	_, upsertErr := a.telegramIdentityStorage.Upsert(ctx, tgId, existing.UserId, username)
	if upsertErr != nil {
		return 0, rerrors.Wrap(upsertErr, "update telegram identity last_logged_at")
	}

	return existing.UserId, nil
}

func (a *AuthService) generateSession(userId int64) domain.UserSession {
	return domain.UserSession{
		UserId:           userId,
		AccessToken:      uuid.New().String(),
		AccessExpiresAt:  time.Now().Add(a.accessTokenTTL),
		RefreshToken:     uuid.New().String(),
		RefreshExpiresAt: time.Now().Add(a.refreshTokenTTL),
	}
}

func (a *AuthService) logOut(ctx context.Context, accessToken string) error {
	err := a.sessionStorage.Delete(ctx, accessToken)
	if err != nil {
		return rerrors.Wrap(err, "failed to delete access token")
	}

	return nil
}
