package auth

import (
	"context"
	"database/sql"
	"strings"

	"github.com/rs/zerolog/log"
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
	var isNewUser bool
	err = s.txManager.Execute(func(tx *sql.Tx) error {
		tgStorage := s.telegramIdentityStorage.WithTx(tx)
		sessionStorage := s.sessionStorage.WithTx(tx)

		// SELECT ... FOR UPDATE in GetByTgIdTx can only lock an existing row, so it
		// can't serialize two concurrent logins for a brand-new telegram id: both
		// would see "not found" and each create a duplicate user + liked playlist.
		// An advisory lock keyed on the telegram id serializes that case too.
		_, txErr := tx.ExecContext(ctx, "SELECT pg_advisory_xact_lock($1)", tgClaims.Id)
		if txErr != nil {
			return rerrors.Wrap(txErr, "acquire telegram login advisory lock")
		}

		identityValue, txErr := tgStorage.GetByTgIdTx(ctx, tgClaims.Id)
		if txErr != nil {
			return rerrors.Wrap(txErr, "get telegram identity for update")
		}

		internalUserId := identityValue.V.UserId
		isNewUser = !identityValue.Valid
		if isNewUser {
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

	if isNewUser {
		notifyErr := s.adminNotifier.NotifyNewUser(session.UserId, telegramDisplayName(tgClaims), tgClaims.Username)
		if notifyErr != nil {
			log.Err(notifyErr).Msg("error notifying admin about new user")
		}
	}

	return session, nil
}

// telegramDisplayName returns a human-readable display name for the admin
// notification, falling back to given+family name when Name is empty.
func telegramDisplayName(claims telegram.TgClaims) string {
	if claims.Name != "" {
		return claims.Name
	}

	return strings.TrimSpace(claims.GivenName + " " + claims.FamilyName)
}

func (s *Service) initTelegramUser(ctx context.Context, tx *sql.Tx, claims telegram.TgClaims) (int64, error) {
	userStorage := s.userStorage.WithTx(tx)
	tgStorage := s.telegramIdentityStorage.WithTx(tx)
	settingsStorage := s.settingsStorage.WithTx(tx)
	playlistStorage := s.playlistStorage.WithTx(tx)

	userBase := domain.UserBaseInfo{
		Username: claims.Name,
		PhotoUrl: sql.Null[string]{
			V:     claims.Picture,
			Valid: true,
		},
	}

	var err error

	userBase.Id, err = userStorage.CreateUser(ctx, userBase)
	if err != nil {
		return userBase.Id, rerrors.Wrap(err, "insert new user for telegram login")
	}

	defaultSettings := domain.UserUiSettings{
		Locale: claims.Locale,
	}
	err = userStorage.SaveSettings(ctx, userBase.Id, defaultSettings)
	if err != nil {
		return userBase.Id, rerrors.Wrap(err, "save default user settings")
	}

	defaultPermissions := domain.UserPermissions{}
	err = userStorage.SavePermissions(ctx, userBase.Id, defaultPermissions)
	if err != nil {
		return userBase.Id, rerrors.Wrap(err, "save default user permissions")
	}

	_, err = tgStorage.Upsert(ctx, claims.Id, userBase.Id, claims.Login)
	if err != nil {
		return userBase.Id, rerrors.Wrap(err, "upsert telegram identity")
	}

	likedPlaylistParams := domain.CreatePlaylistParams{
		Name:     userBase.Username + "'s Likes",
		IsPublic: false,
	}
	likedPlaylistUuid, err := playlistStorage.Create(ctx, likedPlaylistParams, userBase.Id)
	if err != nil {
		return userBase.Id, rerrors.Wrap(err, "create liked songs playlist")
	}

	err = userStorage.SetLikedPlaylistId(ctx, userBase.Id, likedPlaylistUuid)
	if err != nil {
		return userBase.Id, rerrors.Wrap(err, "set user's liked playlist id")
	}

	for _, seg := range domain.DefaultSegments(userBase.Id) {
		err = settingsStorage.SetHomeSegment(ctx, userBase.Id, seg)
		if err != nil {
			return userBase.Id, rerrors.Wrap(err, "set default home segment")
		}
	}

	return userBase.Id, nil
}
