package pg

import (
	"context"
	"database/sql"

	sq "github.com/Masterminds/squirrel"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"go.redsock.ru/rerrors"
	"go.redsock.ru/toolbox"
	"google.golang.org/grpc/codes"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
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

func (s *SongsStorage) Save(ctx context.Context, song domain.SongBase) error {
	params := querier.CreateSongParams{
		ID:     song.Id,
		FileID: song.FileId,
		Title:  song.Title,
	}
	err := s.querier.CreateSong(ctx, params)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (s *SongsStorage) SaveSongsArtists(ctx context.Context, songId int64, artistsId uuid.UUID, orderId int16) error {
	params := querier.UpsertSongArtistParams{
		SongID:     int32(songId),
		ArtistUuid: artistsId,
		OrderID:    orderId,
	}

	err := s.querier.UpsertSongArtist(ctx, params)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
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

func (s *SongsStorage) List(ctx context.Context, r domain.ListSongs) ([]domain.SongBase, error) {
	if r.PlaylistUuid == nil {
		return nil, rerrors.New("no playlist uuid is passed to list songs")
	}
	// TODO
	//builder := sq.Select(
	//	"file_id",
	//	"title",
	//	"artists",
	//	"duration_sec",
	//).
	//	From("playlists_view").
	//	Limit(r.Limit).
	//	Offset(r.Offset).
	//	PlaceholderFormat(sq.Dollar)
	//
	//builder = s.applyListQueryFilters(builder, r)
	//builder = s.applyListQueryOrder(builder, r)
	//
	//querySql, args, err := builder.ToSql()
	//if err != nil {
	//	return nil, rerrors.Wrap(err, "error building query")
	//}
	//
	//rows, err := s.db.QueryContext(ctx, querySql, args...)
	//if err != nil {
	//	return nil, wrapPgErr(err)
	//}
	//defer rows.Close()

	var songs []domain.SongBase
	//for rows.Next() {
	//	var song domain.SongBase
	//	var artistsJson []byte
	//	err = rows.Scan(
	//		&song.UniqueFileId,
	//		&song.Title,
	//		&artistsJson,
	//		&song.Duration,
	//	)
	//	if err != nil {
	//		return nil, wrapPgErr(err)
	//	}
	//
	//	err = json.Unmarshal(artistsJson, &song.Artists)
	//	if err != nil {
	//		return nil, rerrors.Wrap(err, "error unmarshalling artists from storage to model")
	//	}
	//	//by default, it simply scans number to time.Duration
	//	// so need to multiply it by time.Seconds to get actual seconds
	//	song.Duration = song.Duration * time.Second
	//	songs = append(songs, song)
	//}

	return songs, nil
}
func (s *SongsStorage) Count(ctx context.Context, r domain.ListSongs) (uint64, error) {
	if r.PlaylistUuid == nil {
		return 0, rerrors.New("no playlist uuid is passed to count")
	}

	builder := sq.Select("count(*)").
		From("playlists_view").
		PlaceholderFormat(sq.Dollar)

	builder = s.applyListQueryFilters(builder, r)

	querySql, args, err := builder.ToSql()
	if err != nil {
		return 0, rerrors.Wrap(err, "error building query")
	}
	var count uint64
	err = s.db.QueryRowContext(ctx, querySql, args...).
		Scan(&count)
	if err != nil {
		return 0, wrapPgErr(err)
	}

	return count, nil
}

func (s *SongsStorage) GetByFileId(ctx context.Context, id int64) (domain.SongBase, error) {
	return domain.SongBase{}, rerrors.New("unsupported operation", codes.Unimplemented)
}

func (s *SongsStorage) Get(ctx context.Context, id int64) (domain.SongBase, error) {
	songDb, err := s.querier.GetSongById(ctx, int32(id))
	if err != nil {
		return domain.SongBase{}, wrapPgErr(err)
	}

	song := domain.SongBase{
		Id:        songDb.ID,
		Title:     songDb.Title,
		FileId:    songDb.FileID,
		CreatedAt: songDb.CreatedAt,
	}

	return song, nil
}

func (s *SongsStorage) Delete(ctx context.Context, id int64) error {
	err := s.querier.DeleteSongById(ctx, int32(id))
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (s *SongsStorage) applyListQueryFilters(builder sq.SelectBuilder, r domain.ListSongs) sq.SelectBuilder {
	if len(r.UniqueIds) != 0 {
		builder = builder.Where(sq.Eq{
			"file_id": r.UniqueIds,
		})
	} else {
		playlistUuid := toolbox.FromPtr(r.PlaylistUuid)
		builder = builder.Where(sq.Eq{
			"playlist_uuid": playlistUuid,
		})
	}

	return builder
}

func (s *SongsStorage) applyListQueryOrder(builder sq.SelectBuilder, r domain.ListSongs) sq.SelectBuilder {
	field := "order_number"

	switch {
	case r.RandomHash != nil:
		builder = builder.
			Prefix(`WITH shuffle AS (SELECT setseed(?))`, 1_000_000_000_000*(1/float64(*r.RandomHash))).
			Join("shuffle ON true")
		field = "random()"
	}

	direction := ""
	if r.Desc {
		direction = " desc"
	}

	return builder.OrderBy(field + direction)
}

func (s *SongsStorage) WithTx(tx *sql.Tx) storage.SongStorage {
	return NewSongStorage(tx)
}
