package pg

import (
	"context"
	"encoding/json"
	"time"

	sq "github.com/Masterminds/squirrel"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
)

type SongsStorage struct {
	db sqldb.DB
}

func NewSongStorage(db sqldb.DB) *SongsStorage {
	return &SongsStorage{
		db: db,
	}
}

func (s *SongsStorage) Save(ctx context.Context, song domain.SongBase) error {
	return nil
}

func (s *SongsStorage) List(ctx context.Context, r domain.ListSongs) ([]domain.SongBase, error) {
	builder := sq.Select(
		"songs.file_id",
		"songs.tittle",
		"songs.duration_sec",
		`json_agg(
               json_build_object(
                       'uuid', artists.uuid,
                       'name', artists.name
               )
       )`,
	).
		From("songs").
		Join(`artists ON artists.uuid = ANY (songs.artists)`).
		Limit(r.Limit).
		Offset(r.Offset).
		GroupBy("songs.file_id", "songs.tittle", "songs.duration_sec").
		PlaceholderFormat(sq.Dollar)

	builder = s.applyListQueryFilters(builder, r)

	querySql, args, err := builder.ToSql()
	if err != nil {
		return nil, rerrors.Wrap(err, "error building query")
	}

	rows, err := s.db.QueryContext(ctx, querySql, args...)
	if err != nil {
		return nil, wrapPgErr(err)
	}
	defer rows.Close()

	var songs []domain.SongBase
	for rows.Next() {
		var song domain.SongBase
		var artistsJson []byte
		err = rows.Scan(
			&song.UniqueFileId,
			&song.Tittle,
			&song.Duration,
			&artistsJson,
		)
		if err != nil {
			return nil, wrapPgErr(err)
		}

		err = json.Unmarshal(artistsJson, &song.Artists)
		if err != nil {
			return nil, rerrors.Wrap(err, "error unmarshalling artists from storage to model")
		}
		//by default, it simply scans number to time.Duration
		// so need to multiply it by time.Seconds to get actual seconds
		song.Duration = song.Duration * time.Second
		songs = append(songs, song)
	}

	return songs, nil
}

func (s *SongsStorage) Count(ctx context.Context, r domain.ListSongs) (uint64, error) {
	builder := sq.Select("count(*)").
		From("songs")

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

func (s *SongsStorage) applyListQueryFilters(builder sq.SelectBuilder, r domain.ListSongs) sq.SelectBuilder {
	return builder
}
