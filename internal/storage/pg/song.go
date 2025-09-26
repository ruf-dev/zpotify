package pg

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/lib/pq"
	"go.redsock.ru/rerrors"
	"go.redsock.ru/toolbox"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/user_errors"
)

const globalPlaylistUuid = "3a608e96-38ae-470c-83f2-842fc4a70ed2"

type SongsStorage struct {
	db sqldb.DB
}

func NewSongStorage(db sqldb.DB) *SongsStorage {
	return &SongsStorage{
		db: db,
	}
}

func (s *SongsStorage) Save(ctx context.Context, song domain.SongBase) error {
	artistsUuids := make([]string, 0, len(song.Artists))
	for _, artist := range song.Artists {
		artistsUuids = append(artistsUuids, artist.Uuid)
	}

	_, err := s.db.ExecContext(ctx, `
		INSERT INTO songs 
				(file_id, artists, title, duration_sec)
		VALUES 	(     $1,      $2,     $3,           $4)
		ON CONFLICT (file_id) DO UPDATE SET
			artists  	 = excluded.artists,
			title 		 = excluded.title,
			duration_sec = excluded.duration_sec
`, song.UniqueFileId, pq.Array(artistsUuids), song.Title, song.Duration.Seconds())
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (s *SongsStorage) List(ctx context.Context, r domain.ListSongs) ([]domain.SongBase, error) {
	builder := sq.Select(
		"file_id",
		"title",
		"artists",
		"duration_sec",
	).
		From("playlists_view").
		Limit(r.Limit).
		Offset(r.Offset).
		PlaceholderFormat(sq.Dollar)

	builder = s.applyListQueryFilters(builder, r)
	builder = s.applyListQueryOrder(builder, r)

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
			&song.Title,
			&artistsJson,
			&song.Duration,
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

func (s *SongsStorage) Get(ctx context.Context, uniqueId string) (domain.SongBase, error) {
	listReq := domain.ListSongs{
		UniqueIds: []string{uniqueId},
		Limit:     1,
		Offset:    0,
	}

	resp, err := s.List(ctx, listReq)
	if err != nil {
		return domain.SongBase{}, wrapPgErr(err)
	}

	if len(resp) == 0 {
		return domain.SongBase{}, user_errors.ErrNotFound
	}

	return resp[0], nil
}

func (s *SongsStorage) applyListQueryFilters(builder sq.SelectBuilder, r domain.ListSongs) sq.SelectBuilder {
	if len(r.UniqueIds) != 0 {
		builder = builder.Where(sq.Eq{
			"file_id": r.UniqueIds,
		})
	} else {
		playlistId := toolbox.Coalesce(r.PlaylistUuid, toolbox.ToPtr(globalPlaylistUuid))
		builder = builder.Where(sq.Eq{
			"playlist_id": playlistId,
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
