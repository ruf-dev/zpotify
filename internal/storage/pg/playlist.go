package pg

import (
	"go.zpotify.ru/zpotify/internal/clients/sqldb"
)

type PlaylistStorage struct {
	db sqldb.DB
}

func NewPlaylistStorage(db sqldb.DB) *PlaylistStorage {
	return &PlaylistStorage{
		db: db,
	}
}
