package pg

import (
	"database/sql"
	"errors"

	"github.com/lib/pq"
	"github.com/rs/zerolog/log"
	"go.redsock.ru/toolbox/closer"

	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
)

type dataStorage struct {
	authStorage    *AuthStorage
	sessionStorage *SessionStorage

	userStorage         *UserStorage
	userSettingsStorage *UserSettingsStorage

	songsStorage    *SongsStorage
	playlistStorage *PlaylistStorage
	fileMetaStorage *FileMetaStorage

	conn *sql.DB
}

func NewStorage(conn *sql.DB) storage.Storage {
	return &dataStorage{
		NewAuthStorage(conn),
		NewSessionStorage(conn),
		NewUserStorage(conn),
		NewUserSettingsStorage(conn),
		NewSongStorage(conn),
		NewPlaylistStorage(conn),
		NewFileMetaStorage(conn),
		conn,
	}
}

func (d *dataStorage) Auth() storage.AuthStorage {
	return d.authStorage
}

func (d *dataStorage) SessionStorage() storage.SessionStorage {
	return d.sessionStorage
}

func (d *dataStorage) User() storage.UserStorage {
	return d.userStorage
}

func (d *dataStorage) UserSettings() storage.UserSettingsStorage {
	return d.userSettingsStorage
}

func (d *dataStorage) SongsStorage() storage.SongStorage {
	return d.songsStorage
}

func (d *dataStorage) PlaylistStorage() storage.PlaylistStorage {
	return d.playlistStorage
}

func (d *dataStorage) FileMeta() storage.FileMetaStorage {
	return d.fileMetaStorage
}

func (d *dataStorage) TxManager() *tx_manager.TxManager {
	return tx_manager.New(d.conn)
}

func wrapPgErr(err error) error {
	if errors.Is(err, sql.ErrNoRows) {
		return storage.ErrNotFound
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

type scanner interface {
	Scan(dest ...interface{}) error
}

func closeRowScanner(s closer.Closable) {
	err := s()
	if err != nil {
		log.Err(err).
			Msg("error closing row scanner")
	}
}
