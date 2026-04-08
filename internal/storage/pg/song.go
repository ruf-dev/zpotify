package pg

import (
	"context"
	"database/sql"

	"github.com/lib/pq"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/storage"
	querier "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

type SongsStorage struct {
	db      sqldb.DB
	querier querier.Querier
}

func NewSongStorage(db sqldb.DB) *SongsStorage {
	return &SongsStorage{
		db:      db,
		querier: querier.New(db),
	}
}

func (s *SongsStorage) AddSongsToPlaylist(ctx context.Context, playlistUuid string, songIds ...int32) error {
	_, err := s.db.ExecContext(ctx, `
		 INSERT INTO playlist_songs (playlist_uuid, file_id, order_number)
       	SELECT
       	    $1,
       	    unnest($2::text[]),
              (
              	SELECT
                   COALESCE(MAX(order_number), 0) + 1
               FROM playlist_songs
               WHERE playlist_uuid = $1) + generate_series(0, array_length($2::text[], 1) - 1)
`, playlistUuid, pq.Int32Array(songIds))
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (s *SongsStorage) WithTx(tx *sql.Tx) storage.SongStorage {
	return NewSongStorage(tx)
}
