package v1

import (
	"context"
	"database/sql"

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

			err = userStorage.SavePermissions(ctx, user.TgId, user.Permissions)
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

	filter := domain.GetUserFilter{
		TgUserId: []int64{uc.TgUserId},
	}

	users, err := u.userStorage.ListUsers(ctx, filter)
	if err != nil {
		return domain.User{}, rerrors.Wrap(err, "error getting user from storage")
	}

	if len(users) == 0 {
		return domain.User{}, rerrors.Wrap(user_errors.ErrNotFound, "user not found")
	}

	return users[0], nil
}

func (u *UserService) Get(ctx context.Context, tgId int64) (domain.User, error) {
	filter := domain.GetUserFilter{
		TgUserId: []int64{tgId},
	}

	users, err := u.userStorage.ListUsers(ctx, filter)
	if err != nil {
		return domain.User{}, rerrors.Wrap(err, "error getting user from storage")
	}

	if len(users) == 0 {
		return domain.User{}, rerrors.Wrap(user_errors.ErrNotFound, "user not found")
	}

	return users[0], nil
}

func (u *UserService) GetByUsername(ctx context.Context, tgUsername string) (domain.User, error) {
	filter := domain.GetUserFilter{
		Username: []string{tgUsername},
	}

	users, err := u.userStorage.ListUsers(ctx, filter)
	if err != nil {
		return domain.User{}, rerrors.Wrap(err, "error getting user from storage")
	}

	if len(users) == 0 {
		return domain.User{}, rerrors.Wrap(user_errors.ErrNotFound, "user not found")
	}

	return users[0], nil
}
