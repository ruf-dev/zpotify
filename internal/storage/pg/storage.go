package pg

import (
	"database/sql"

	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
)

type dataStorage struct {
	userStorage *UserStorage

	conn *sql.DB
}

func NewStorage(conn *sql.DB) storage.Storage {
	return &dataStorage{
		userStorage: NewUserStorage(conn),
		conn:        conn,
	}
}

func (d *dataStorage) User() storage.UserStorage {
	return d.userStorage
}

func (d *dataStorage) TxManager() *tx_manager.TxManager {
	return tx_manager.New(d.conn)
}
