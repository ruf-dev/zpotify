package auth

import (
	"context"
	"database/sql"

	"go.redsock.ru/rerrors"

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
