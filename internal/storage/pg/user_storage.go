package pg

import (
	"context"
	"database/sql"
	"strings"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

type UserStorage struct {
	db sqldb.DB
}

func NewUserStorage(db sqldb.DB) *UserStorage {
	return &UserStorage{
		db: db,
	}
}

func (s *UserStorage) Upsert(ctx context.Context, user domain.UserInfo) error {
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO users
				(tg_id, tg_username) 
		VALUES  (   $1,          $2) 
		ON CONFLICT (tg_id) 
		DO UPDATE SET
		              tg_username = excluded.tg_username`,
		user.TgId, user.TgUserName,
	)
	if err != nil {
		return rerrors.Wrap(wrapPgErr(err), "error upserting user")
	}

	return nil
}

func (s *UserStorage) SaveSettings(ctx context.Context, userTgId int64, settings domain.UserSettings) error {
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO user_settings 
		       (user_tg_id, locale) 
		VALUES (        $1,     $2)
		ON CONFLICT (user_tg_id) 
		DO UPDATE SET
		              locale = EXCLUDED.locale
		`,
		userTgId,
		settings.Locale)
	if err != nil {
		return rerrors.Wrap(wrapPgErr(err), "error saving settings")
	}

	return nil
}

func (s *UserStorage) GetUser(ctx context.Context, tgUserId int64) (u domain.User, err error) {
	u.TgId = tgUserId

	err = s.db.QueryRowContext(ctx, `
		SELECT 
			u.tg_username,
			settings.locale,
			COALESCE(permissions.can_upload, '0'),
			COALESCE(permissions.early_access, '0')
		FROM users u
		LEFT JOIN user_settings    AS settings 
		ON        u.tg_id           = settings.user_tg_id
		LEFT JOIN user_permissions AS permissions 
		ON        u.tg_id           = permissions.user_tg_id
		
		WHERE u.tg_id = $1`,
		u.TgId).
		Scan(
			&u.TgUserName,
			&u.Locale,

			&u.Permissions.CanUpload,
			&u.Permissions.EarlyAccess,
		)
	if err != nil {
		return u, rerrors.Wrap(wrapPgErr(err), "error getting user from db")
	}

	return u, nil
}

func (s *UserStorage) GetUserByUsername(ctx context.Context, username string) (u domain.User, err error) {
	username = strings.ToLower(username)

	u.TgUserName = username

	err = s.db.QueryRowContext(ctx, `
		SELECT 
			u.tg_id,
			settings.locale,
			COALESCE(permissions.can_upload, '0'),
			COALESCE(permissions.early_access, '0')
		FROM users u
		LEFT JOIN user_settings    AS settings 
		ON        u.tg_id           = settings.user_tg_id
		LEFT JOIN user_permissions AS permissions 
		ON        u.tg_id           = permissions.user_tg_id
		
		WHERE lower(u.tg_username) = $1`, username).
		Scan(
			&u.TgUserName,
			&u.Locale,

			&u.Permissions.CanUpload,
			&u.Permissions.EarlyAccess,
		)
	if err != nil {
		return u, wrapPgErr(err)
	}

	return u, nil
}

func (s *UserStorage) WithTx(tx *sql.Tx) storage.UserStorage {
	return NewUserStorage(tx)
}
