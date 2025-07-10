package v1

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

type UserService struct {
	userStorage storage.UserStorage
}

func NewUserService(dataStorage storage.Storage) *UserService {
	return &UserService{
		userStorage: dataStorage.User(),
	}
}

func (u *UserService) Init(ctx context.Context, user domain.User) error {
	err := u.userStorage.Upsert(ctx, user)
	if err != nil {
		return rerrors.Wrap(err, "error to saving user to storage")
	}

	return nil
}
