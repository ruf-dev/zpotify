package v1

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"sync"
	"time"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"
	"google.golang.org/grpc/codes"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/storage"
	auth_q "go.zpotify.ru/zpotify/internal/storage/pg/generated/auth"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
	"go.zpotify.ru/zpotify/internal/user_errors"
)

type authData struct {
	outC      chan domain.UserSession
	createdAt time.Time
}

type AuthService struct {
	m sync.Map

	authStorage    storage.AuthStorage
	sessionStorage storage.SessionStorage
	userStorage    storage.UserStorage

	txManager *tx_manager.TxManager

	accessTokenTTL     time.Duration
	refreshTokenTTL    time.Duration
	maxSessionsPerUser int
}

func NewAuthService(data storage.Storage) *AuthService {
	return &AuthService{
		sessionStorage: data.SessionStorage(),
		authStorage:    data.Auth(),
		userStorage:    data.User(),

		txManager: data.TxManager(),

		accessTokenTTL:     time.Hour,
		refreshTokenTTL:    time.Hour * 24 * 7,
		maxSessionsPerUser: 3,
	}
}

func (a *AuthService) AuthWithPassword(ctx context.Context, login string, password string) (domain.UserSession, error) {
	identity, err := a.authStorage.GetIdentitiesByUsernameAndProvider(ctx, login, auth_q.IdentityProviderZPOTIFY)
	if err != nil {
		if !errors.Is(err, storage.ErrNotFound) {
			return domain.UserSession{}, rerrors.Wrap(err)
		}

		return domain.UserSession{}, rerrors.Wrap(err, "no such user or password mismatched")
	}

	var zpotifyIdentity domain.ZpotifyIdentity

	err = json.Unmarshal(identity.Payload, &zpotifyIdentity)
	if err != nil {
		return domain.UserSession{}, rerrors.Wrap(err)
	}

	if zpotifyIdentity.Password != password {
		return domain.UserSession{}, rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	session := a.generateSession(int64(identity.ID))

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

	newSession := a.generateSession(tgId)

	err := a.txManager.Execute(func(tx *sql.Tx) error {
		sessions, err := a.sessionStorage.ListByUserId(ctx, tgId)
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
		return domain.UserSession{}, rerrors.New("refresh token expired")
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

func (a *AuthService) ListAuthMethods(ctx context.Context) error {
	return rerrors.New("not implemented", codes.Unimplemented)
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
