package storage

import (
	"context"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage/pg"
)

type Storage interface {
	User() UserStorage
}

type UserStorage interface {
	Upsert(ctx context.Context, user domain.User) error
}

type dataStorage struct {
	userStorage *pg.UserStorage
}

func NewStorage(db sqldb.DB) Storage {
	return &dataStorage{
		userStorage: pg.NewUserStorage(db),
	}
}

func (d *dataStorage) User() UserStorage {
	return d.userStorage
}
