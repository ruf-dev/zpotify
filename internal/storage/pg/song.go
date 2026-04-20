package pg

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/songs_q"
)

type SongsStorage struct {
	db      sqldb.DB
	querier songs_q.Querier
}

func NewSongStorage(db sqldb.DB) *SongsStorage {
	return &SongsStorage{
		db:      db,
		querier: songs_q.New(db),
	}
}

func (s *SongsStorage) Create(ctx context.Context, params songs_q.CreateSongParams) (int64, error) {
	id, err := s.querier.CreateSong(ctx, params)
	if err != nil {
		return 0, wrapPgErr(err)
	}

	return id, nil
}

func (s *SongsStorage) AddArtist(ctx context.Context, songId int64, artistUuid string, order int) error {
	aUuid, err := uuid.Parse(artistUuid)
	if err != nil {
		return rerrors.Wrap(err, "error parsing artist uuid")
	}

	_, err = s.db.ExecContext(ctx, `
		INSERT INTO songs_artists (song_id, artist_uuid, order_id)
		VALUES ($1, $2, $3)
		ON CONFLICT (song_id, artist_uuid) DO UPDATE SET order_id = EXCLUDED.order_id
	`, songId, aUuid, order)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

//func (s *SongsStorage) AddSongsToPlaylist(ctx context.Context, playlistUuid string, songIds ...int32) error {
//	_, err := s.db.ExecContext(ctx, `
//		 INSERT INTO playlist_songs (playlist_uuid, file_id, order_number)
//       	SELECT
//       	    $1,
//       	    unnest($2::text[]),
//              (
//              	SELECT
//                   COALESCE(MAX(order_number), 0) + 1
//               FROM playlist_songs
//               WHERE playlist_uuid = $1) + generate_series(0, array_length($2::text[], 1) - 1)
//`, playlistUuid, pq.Int32Array(songIds))
//	if err != nil {
//		return wrapPgErr(err)
//	}
//
//	return nil
//}

func (s *SongsStorage) WithTx(tx *sql.Tx) storage.SongStorage {
	return &SongsStorage{
		db:      &txWrapper{tx},
		querier: songs_q.New(tx),
	}
}
