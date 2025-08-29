package v1

import (
	"context"
	"database/sql"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/localization"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
)

type UserService struct {
	userStorage storage.UserStorage
	txManager   *tx_manager.TxManager
}

func NewUserService(dataStorage storage.Storage) *UserService {
	return &UserService{
		userStorage: dataStorage.User(),
		txManager:   dataStorage.TxManager(),
	}
}

func (u *UserService) Init(ctx context.Context, user domain.User) error {
	user.Locale = string(localization.GetLocaleOrDefault(user.Locale))

	err := u.txManager.Execute(
		func(tx *sql.Tx) error {
			userStorage := u.userStorage.WithTx(tx)

			err := userStorage.Upsert(ctx, user.UserInfo)
			if err != nil {
				return rerrors.Wrap(err, "error upserting user's info")
			}

			err = userStorage.SaveSettings(ctx, user.TgId, user.UserSettings)
			if err != nil {
				return rerrors.Wrap(err, "error saving user's settings")
			}

			return nil
		})
	if err != nil {
		return rerrors.Wrap(err, "error saving user to storage")
	}
	return nil
}

func (u *UserService) Get(ctx context.Context, tgId int64) (domain.User, error) {
	user, err := u.userStorage.GetUser(ctx, tgId)
	if err != nil {
		return user, rerrors.Wrap(err, "error getting user from storage")
	}

	return user, nil
}

func (u *UserService) GetByUsername(ctx context.Context, tgUsername string) (domain.User, error) {
	user, err := u.userStorage.GetUserByUsername(ctx, tgUsername)
	if err != nil {
		return user, rerrors.Wrap(err, "error getting user from storage")
	}

	return user, nil
}
