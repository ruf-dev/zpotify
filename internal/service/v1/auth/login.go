package auth

import (
	"context"

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
	claims, err := s.tgJwkParser.ParseAndVerifyIdToken(idToken)
	if err != nil {
		return domain.UserSession{}, rerrors.Wrap(err, "")
	}

	//tgId, err := strconv.ParseInt(claims.Subject, 10, 64)
	//if err != nil {
	//	return domain.UserSession{}, rerrors.Wrap(err, "parse telegram id from subject claim")
	//}

	login := claims.Name
	if login == "" {
		login = claims.GivenName
	}

	//newUserId, insertErr := s.userStorage.Insert(ctx, username)
	//if insertErr != nil {
	//	return 0, rerrors.Wrap(insertErr, "insert new user for telegram login")
	//}
	//
	//_, upsertErr := s.telegramIdentityStorage.Upsert(ctx, tgId, newUserId, username)
	//if upsertErr != nil {
	//	return 0, rerrors.Wrap(upsertErr, "insert telegram identity")
	//}
	//
	//session := s.generateSession(internalUserId)

	//err = s.sessionStorage.Upsert(ctx, session)
	//if err != nil {
	//	return domain.UserSession{}, rerrors.Wrap(err, "upsert session")
	//}

	return domain.UserSession{}, nil
}
