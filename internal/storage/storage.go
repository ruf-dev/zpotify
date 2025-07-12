package storage

import (
	"context"
	"database/sql"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
)

type Storage interface {
	User() UserStorage

	TxManager() *tx_manager.TxManager
}

type UserStorage interface {
	Upsert(ctx context.Context, user domain.UserInfo) error
	SaveSettings(ctx context.Context, id int64, settings domain.UserSettings) error
	GetUser(ctx context.Context, id int64) (domain.User, error)

	WithTx(tx *sql.Tx) UserStorage
}
