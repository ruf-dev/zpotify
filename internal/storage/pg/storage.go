package pg

import (
	"database/sql"
	"errors"

	"github.com/lib/pq"

	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
	"go.zpotify.ru/zpotify/internal/user_errors"
)

type dataStorage struct {
	userStorage     *UserStorage
	fileMetaStorage *FileMetaStorage
	sessionStorage  *SessionStorage

	conn *sql.DB
}

func NewStorage(conn *sql.DB) storage.Storage {
	return &dataStorage{
		userStorage:     NewUserStorage(conn),
		fileMetaStorage: NewFileMetaStorage(conn),
		sessionStorage:  NewSessionStorage(conn),

		conn: conn,
	}
}

func (d *dataStorage) FileMeta() storage.FileMetaStorage {
	return d.fileMetaStorage
}

func (d *dataStorage) User() storage.UserStorage {
	return d.userStorage
}

func (d *dataStorage) SessionStorage() storage.SessionStorage {
	return d.sessionStorage
}

func (d *dataStorage) TxManager() *tx_manager.TxManager {
	return tx_manager.New(d.conn)
}

func wrapPgErr(err error) error {
	if errors.Is(err, sql.ErrNoRows) {
		return user_errors.ErrNotFound
	}

	pgErr := &pq.Error{}
	if !errors.As(err, &pgErr) {
		return err
	}

	switch pgErr.Code {
	case "23505":
		return storage.ErrAlreadyExists
	default:
		return err
	}
}
