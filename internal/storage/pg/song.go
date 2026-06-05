package pg

import (
	"context"
	"database/sql"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
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

func (s *SongsStorage) GetById(ctx context.Context, songId int64) (domain.Song, error) {
	row, err := s.querier.GetSongById(ctx, songId)
	if err != nil {
		return domain.Song{}, wrapPgErr(err)
	}

	domainArtists, err := s.listArtists(ctx, songId)
	if err != nil {
		return domain.Song{}, rerrors.Wrap(err, "error listing artists")
	}

	song := domain.Song{
		SongBase: toSongBase(row),
		Artists:  domainArtists,
	}

	return song, nil
}

func (s *SongsStorage) GetByFileId(ctx context.Context, fileId int64) (domain.Song, error) {
	row, err := s.querier.GetSongByFileId(ctx, fileId)
	if err != nil {
		return domain.Song{}, wrapPgErr(err, withEntityInfo("file_id", fileId))
	}

	domainArtists, err := s.listArtists(ctx, row.ID)
	if err != nil {
		return domain.Song{}, rerrors.Wrap(err, "error listing artists")
	}

	song := domain.Song{
		SongBase: toSongBase(row),
		Artists:  domainArtists,
	}

	return song, nil
}

func (s *SongsStorage) Create(ctx context.Context, params songs_q.CreateSongParams) (int64, error) {
	id, err := s.querier.CreateSong(ctx, params)
	if err != nil {
		return 0, wrapPgErr(err, withEntityInfo("song", params.FileID))
	}

	return id, nil
}

func (s *SongsStorage) CreateBatch(ctx context.Context, songs []songs_q.CreateSongParams) ([]int64, error) {
	builder := sq.Insert("songs").
		Columns("file_id", "title").
		Suffix("RETURNING id").
		PlaceholderFormat(sq.Dollar)

	for _, p := range songs {
		builder = builder.Values(p.FileID, p.Title)
	}

	query, args, err := builder.ToSql()
	if err != nil {
		return nil, rerrors.Wrap(err, "error building batch insert query")
	}

	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, wrapPgErr(err)
	}
	defer rows.Close()

	ids := make([]int64, 0, len(songs))
	for rows.Next() {
		var id int64
		err = rows.Scan(&id)
		if err != nil {
			return nil, rerrors.Wrap(err, "error scanning song id")
		}
		ids = append(ids, id)
	}

	err = rows.Err()
	if err != nil {
		return nil, rerrors.Wrap(err, "error iterating song rows")
	}

	return ids, nil
}

func (s *SongsStorage) UpdateTitle(ctx context.Context, songId int64, title string) error {
	params := songs_q.UpdateSongTitleParams{
		ID:    songId,
		Title: title,
	}
	err := s.querier.UpdateSongTitle(ctx, params)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (s *SongsStorage) ClearArtists(ctx context.Context, songId int64) error {
	err := s.querier.ClearSongArtists(ctx, songId)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
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

func (s *SongsStorage) listArtists(ctx context.Context, songId int64) ([]domain.ArtistsBase, error) {
	artists, err := s.querier.GetArtistsBySongId(ctx, songId)
	if err != nil {
		return nil, wrapPgErr(err)
	}

	domainArtists := make([]domain.ArtistsBase, len(artists))
	for i, a := range artists {
		domainArtists[i] = domain.ArtistsBase{
			Uuid: a.Uuid.String(),
			Name: a.Name,
		}
	}

	return domainArtists, nil
}
func (s *SongsStorage) WithTx(tx *sql.Tx) storage.SongStorage {
	return &SongsStorage{
		db:      &txWrapper{tx},
		querier: songs_q.New(tx),
	}
}

func toSongBase(song songs_q.SongBaseViewV1) domain.SongBase {
	return domain.SongBase{
		Id:       song.ID,
		Title:    song.Title,
		Duration: time.Duration(song.DurationSec) * time.Second,
		FilePath: song.FilePath,
		FileId:   song.FileID,
	}
}
