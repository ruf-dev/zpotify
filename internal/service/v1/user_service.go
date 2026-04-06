package v1

import (
	"context"
	"database/sql"
	"errors"

	"go.redsock.ru/rerrors"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/localization"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
	"go.zpotify.ru/zpotify/internal/user_errors"
)

type UserService struct {
	userStorage     storage.UserStorage
	settingsStorage storage.UserSettingsStorage

	txManager *tx_manager.TxManager
}

func NewUserService(dataStorage storage.Storage) *UserService {
	return &UserService{
		dataStorage.User(),
		dataStorage.UserSettings(),
		dataStorage.TxManager(),
	}
}

func (u *UserService) Init(ctx context.Context, user domain.User) error {
	user.Locale = string(localization.GetLocaleOrDefault(user.Locale))

	err := u.txManager.Execute(
		func(tx *sql.Tx) error {
			userStorage := u.userStorage.WithTx(tx)

			err := userStorage.Upsert(ctx, user.UserBaseInfo.Username)
			if err != nil {
				return rerrors.Wrap(err, "error upserting user's info")
			}

			err = userStorage.SaveSettings(ctx, user.Id, user.UserUiSettings)
			if err != nil {
				return rerrors.Wrap(err, "error saving user's settings")
			}

			err = userStorage.SavePermissions(ctx, user.Id, user.Permissions)
			if err != nil {
				return rerrors.Wrap(err, "error saving user's permissions")
			}

			return nil
		})
	if err != nil {
		return rerrors.Wrap(err, "error saving user to storage")
	}
	return nil
}

func (u *UserService) GetMe(ctx context.Context) (domain.User, error) {
	uc, ok := user_context.GetUserContext(ctx)
	if !ok {
		return domain.User{}, status.Error(codes.Unauthenticated, "no user id in context")
	}

	user, err := u.userStorage.GetUserById(ctx, uc.UserId)
	if err != nil {
		return domain.User{}, rerrors.Wrap(err, "error getting user from storage")
	}

	permissions, err := u.userStorage.GetPermissions(ctx, uc.UserId)
	if err != nil {
		return domain.User{}, rerrors.Wrap(err, "error getting permissions from storage")
	}

	return domain.User{
		UserBaseInfo: user,
		//TODO
		UserUiSettings: domain.UserUiSettings{},
		Permissions:    permissions,
	}, nil
}

func (u *UserService) Get(ctx context.Context, userId int64) (domain.User, error) {
	user, err := u.userStorage.GetUserById(ctx, userId)
	if err != nil {
		return domain.User{}, rerrors.Wrap(err, "error getting user from storage")
	}

	return domain.User{
		UserBaseInfo: user,
		//TODO
		UserUiSettings: domain.UserUiSettings{},
		Permissions:    domain.UserPermissions{},
	}, nil
}

func (u *UserService) GetByUsername(ctx context.Context, tgUsername string) (domain.User, error) {
	//filter := domain.GetUserFilter{
	//	Username: []string{tgUsername},
	//}

	//users, err := u.userStorage.Get(ctx, filter)
	//if err != nil {
	//	return domain.User{}, rerrors.Wrap(err, "error getting user from storage")
	//}
	//
	//if len(users) == 0 {
	//	return domain.User{}, rerrors.Wrap(user_errors.ErrNotFound, "user not found")
	//}

	return domain.User{}, nil
}

func (u *UserService) GetSettings(ctx context.Context) (settings domain.UserSettings, err error) {
	uc, ok := user_context.GetUserContext(ctx)
	if !ok {
		return domain.UserSettings{}, rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	settings.HomeSegments, err = u.settingsStorage.GetHomeSegments(ctx, uc.UserId)
	if err != nil {
		return settings, rerrors.Wrap(err, "error reading home segments from storage")
	}

	settings.Ui, err = u.settingsStorage.GetUiSettings(ctx, uc.UserId)
	if err != nil {
		if !errors.Is(err, storage.ErrNotFound) {
			return settings, rerrors.Wrap(err, "error reading ui settings from storage")
		}
		settings.Ui = defaultUiSettings()
	}

	return settings, nil
}

func defaultUiSettings() domain.UserUiSettings {
	return domain.UserUiSettings{
		Locale: string(localization.En),
	}
}
