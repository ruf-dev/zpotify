package v1

import (
	"context"
	"database/sql"
	"sync"
	"time"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"
	"google.golang.org/grpc/codes"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
)

type authData struct {
	outC      chan domain.UserSession
	createdAt time.Time
}

type AuthService struct {
	m sync.Map

	sessionStorage storage.SessionStorage

	txManager *tx_manager.TxManager

	accessTokenTTL  time.Duration
	refreshTokenTTL time.Duration
}

func NewAuthService(data storage.Storage) *AuthService {
	return &AuthService{
		sessionStorage: data.SessionStorage(),
		txManager:      data.TxManager(),

		accessTokenTTL:  time.Hour,
		refreshTokenTTL: time.Hour * 24 * 7,
	}
}

func (a *AuthService) InitAuth() (authUuid string, doneC chan domain.UserSession) {
	authUuid = uuid.New().String()

	ad := authData{
		outC:      make(chan domain.UserSession),
		createdAt: time.Time{},
	}

	a.m.Store(authUuid, ad)

	return authUuid, ad.outC
}

func (a *AuthService) AckAuth(ctx context.Context, authUuid string, tgId int64) error {
	c, ok := a.m.LoadAndDelete(authUuid)
	if !ok {
		return nil
	}

	ad, ok := c.(authData)
	if !ok {
		return rerrors.New("failed mapping %T to authData", c)
	}
	defer close(ad.outC)

	session := a.generateSession(tgId)

	err := a.sessionStorage.Upsert(ctx, session)
	if err != nil {
		return rerrors.Wrap(err, "failed to generate access token")
	}

	ad.outC <- session

	return nil
}

func (a *AuthService) AuthWithToken(ctx context.Context, token string) (tgId int64, err error) {
	accessToken, err := a.sessionStorage.GetByAccessToken(ctx, token)
	if err != nil {
		return 0, rerrors.Wrap(err, "failed to get access token")
	}

	if accessToken.AccessExpiresAt.Before(time.Now().UTC()) {
		return 0, rerrors.New("access token expired", codes.Unauthenticated)
	}

	return accessToken.UserTgId, nil
}

func (a *AuthService) Refresh(ctx context.Context, refreshToken string) (domain.UserSession, error) {
	oldSession, err := a.sessionStorage.GetByRefreshToken(ctx, refreshToken)
	if err != nil {
		return domain.UserSession{}, rerrors.Wrap(err, "failed to get access token")
	}

	if oldSession.RefreshExpiresAt.Before(time.Now().UTC()) {
		return domain.UserSession{}, rerrors.New("refresh token expired")
	}

	newSession := a.generateSession(oldSession.UserTgId)

	err = a.txManager.Execute(
		func(tx *sql.Tx) error {
			sessionStorage := a.sessionStorage.WithTx(tx)

			err = sessionStorage.Delete(ctx, oldSession.AccessToken)
			if err != nil {
				return rerrors.Wrap(err, "failed to delete old access token")
			}

			err = sessionStorage.Upsert(ctx, newSession)
			if err != nil {
				return rerrors.Wrap(err, "failed to upsert new access token")
			}

			return nil
		})
	if err != nil {
		return domain.UserSession{}, rerrors.Wrap(err)
	}

	return newSession, nil
}

func (a *AuthService) generateSession(tgId int64) domain.UserSession {
	return domain.UserSession{
		UserTgId:         tgId,
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
