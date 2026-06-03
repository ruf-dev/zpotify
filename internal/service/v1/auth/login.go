package auth

import (
	"context"
	"database/sql"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/telegram"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (s *Service) Login(ctx context.Context, login string, password string) (domain.UserSession, error) {
	var session domain.UserSession

	identity, err := s.zpotifyIdentityStorage.GetByLogoPass(ctx, login, password)
	if err != nil {
		return domain.UserSession{}, rerrors.Wrap(err)
	}

	session = s.generateSession(identity.UserId)

	err = s.sessionStorage.Upsert(ctx, session)
	if err != nil {
		return domain.UserSession{}, rerrors.Wrap(err)
	}

	return session, nil
}

func (s *Service) LoginViaTelegram(ctx context.Context, idToken string) (domain.UserSession, error) {
	tgClaims, err := s.tgJwkParser.ParseAndVerifyIdToken(idToken)
	if err != nil {
		return domain.UserSession{}, rerrors.Wrap(err)
	}

	var session domain.UserSession
	err = s.txManager.Execute(func(tx *sql.Tx) error {
		tgStorage := s.telegramIdentityStorage.WithTx(tx)
		sessionStorage := s.sessionStorage.WithTx(tx)

		identityValue, txErr := tgStorage.GetByTgIdTx(ctx, tgClaims.Id)
		if txErr != nil {
			return rerrors.Wrap(txErr, "get telegram identity for update")
		}

		internalUserId := identityValue.V.UserId
		if !identityValue.Valid {
			internalUserId, err = s.initTelegramUser(ctx, tx, tgClaims)
			if err != nil {
				return rerrors.Wrap(err, "create telegram user")
			}
		}

		session = s.generateSession(internalUserId)

		txErr = sessionStorage.Upsert(ctx, session)
		if txErr != nil {
			return rerrors.Wrap(txErr, "upsert session")
		}

		return nil
	})
	if err != nil {
		return domain.UserSession{}, rerrors.Wrap(err)
	}

	return session, nil
}

func (s *Service) initTelegramUser(ctx context.Context, tx *sql.Tx, claims telegram.TgClaims) (userId int64, err error) {
	userStorage := s.userStorage.WithTx(tx)
	tgStorage := s.telegramIdentityStorage.WithTx(tx)

	userId, err = userStorage.Insert(ctx, claims.Name)
	if err != nil {
		return userId, rerrors.Wrap(err, "insert new user for telegram login")
	}

	defaultSettings := domain.UserUiSettings{
		Locale: claims.Locale,
	}
	err = userStorage.SaveSettings(ctx, userId, defaultSettings)
	if err != nil {
		return userId, rerrors.Wrap(err, "save default user settings")
	}

	defaultPermissions := domain.UserPermissions{}
	err = userStorage.SavePermissions(ctx, userId, defaultPermissions)
	if err != nil {
		return userId, rerrors.Wrap(err, "save default user permissions")
	}

	_, err = tgStorage.Upsert(ctx, claims.Id, userId, claims.Login)
	if err != nil {
		return userId, rerrors.Wrap(err, "upsert telegram identity")
	}

	return userId, nil
}
