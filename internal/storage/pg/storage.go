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
	telegramIdentityStorage *TelegramIdentityStorage
	zpotifyIdentityStorage  *ZpotifyIdentityStorage

	sessionStorage *SessionStorage

	userStorage         *UserStorage
	userSettingsStorage *UserSettingsStorage

	songsStorage    *SongsStorage
	playlistStorage *PlaylistStorage
	artistStorage   *ArtistsStorage
	fileMetaStorage *FileMetaStorage

	conn *sql.DB
}

func NewStorage(conn *sql.DB) storage.Storage {
	return &dataStorage{
		telegramIdentityStorage: NewTelegramIdentityStorage(conn),
		zpotifyIdentityStorage:  NewZpotifyIdentityStorage(conn),
		sessionStorage:          NewSessionStorage(conn),
		userStorage:             NewUserStorage(conn),
		userSettingsStorage:     NewUserSettingsStorage(conn),
		songsStorage:            NewSongStorage(conn),
		playlistStorage:         NewPlaylistStorage(conn),
		artistStorage:           NewArtistsStorage(conn),
		fileMetaStorage:         NewFileMetaStorage(conn),
		conn:                    conn,
	}
}

func (d *dataStorage) TelegramIdentity() storage.TelegramIdentityStorage {
	return d.telegramIdentityStorage
}

func (d *dataStorage) ZpotifyIdentity() storage.ZpotifyIdentityStorage {
	return d.zpotifyIdentityStorage
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

func (d *dataStorage) ArtistStorage() storage.ArtistStorage {
	return d.artistStorage
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
