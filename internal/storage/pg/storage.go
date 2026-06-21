package pg

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/lib/pq"
	"github.com/rs/zerolog/log"
	"go.redsock.ru/rerrors"
	"go.redsock.ru/toolbox/closer"
	"google.golang.org/genproto/googleapis/rpc/errdetails"

	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
)

type dataStorage struct {
	telegramIdentityStorage *TelegramIdentityStorage
	zpotifyIdentityStorage  *ZpotifyIdentityStorage

	sessionStorage *SessionStorage

	userStorage         *UserStorage
	userSettingsStorage *UserSettingsStorage

	songsStorage            *SongsStorage
	playlistStorage         *PlaylistStorage
	artistStorage           *ArtistsStorage
	fileMetaStorage         *FileMetaStorage
	garbageCollectorStorage *GarbageCollectorStorage

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
		garbageCollectorStorage: NewGarbageCollectorStorage(conn),
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

func (d *dataStorage) GarbageCollector() storage.GarbageCollectorStorage {
	return d.garbageCollectorStorage
}

func (d *dataStorage) TxManager() *tx_manager.TxManager {
	return tx_manager.New(d.conn)
}

type errInfo struct {
}

type wrapperOpt func(e error) error

func wrapPgErr(err error, opt ...wrapperOpt) error {
	if errors.Is(err, sql.ErrNoRows) {
		return storage.ErrNotFound
	}

	pgErr := &pq.Error{}
	if !errors.As(err, &pgErr) {
		return err
	}

	switch pgErr.Code {
	case "23505":
		err = storage.ErrAlreadyExists
	}

	for _, o := range opt {
		err = o(err)
	}

	return err
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

func withEntityInfo(entityType string, entityIdentifier any) wrapperOpt {
	return func(e error) error {
		return rerrors.Wrap(e, &errdetails.ErrorInfo{
			Reason: e.Error(),
			Domain: "storage",
			Metadata: map[string]string{
				"entity_type": entityType,
				"entity_id":   fmt.Sprint(entityIdentifier),
			},
		})
	}
}
