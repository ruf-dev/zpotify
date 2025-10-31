package pg

import (
	"database/sql"
	"errors"

	"github.com/lib/pq"

	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
)

type dataStorage struct {
	userStorage    *UserStorage
	sessionStorage *SessionStorage

	fileMetaStorage *FileMetaStorage
	songStorage     *SongsStorage
	artistsStorage  *ArtistsStorage

	playlistStorage *PlaylistStorage

	conn *sql.DB
}

func NewStorage(conn *sql.DB) storage.Storage {
	return &dataStorage{
		userStorage:    NewUserStorage(conn),
		sessionStorage: NewSessionStorage(conn),

		fileMetaStorage: NewFileMetaStorage(conn),
		songStorage:     NewSongStorage(conn),
		artistsStorage:  NewArtistsStorage(conn),

		playlistStorage: NewPlaylistStorage(conn),

		conn: conn,
	}
}

func (d *dataStorage) FileMeta() storage.FileMetaStorage {
	return d.fileMetaStorage
}

func (d *dataStorage) ArtistStorage() storage.ArtistStorage {
	return d.artistsStorage
}

func (d *dataStorage) User() storage.UserStorage {
	return d.userStorage
}

func (d *dataStorage) SessionStorage() storage.SessionStorage {
	return d.sessionStorage
}

func (d *dataStorage) SongStorage() storage.SongStorage {
	return d.songStorage
}
func (d *dataStorage) PlaylistStorage() storage.PlaylistStorage {
	return d.playlistStorage
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
