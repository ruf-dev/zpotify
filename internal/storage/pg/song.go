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
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO songs 
				(file_id,  title, duration_sec)
		VALUES 	(     $1,     $2,           $3)
		ON CONFLICT (file_id) DO UPDATE SET
			title 		 = excluded.title,
			duration_sec = excluded.duration_sec;
`, song.UniqueFileId, song.Title, song.Duration.Seconds())
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (s *SongsStorage) SaveSongsArtists(ctx context.Context, song domain.SongBase) error {
	artistsUuids := make([]string, 0, len(song.Artists))
	for _, artist := range song.Artists {
		artistsUuids = append(artistsUuids, artist.Uuid)
	}

	_, err := s.db.ExecContext(ctx, `
		WITH input AS (
			SELECT $1::text AS song_id,
			       unnest($2::uuid[]) AS artist_uuid,
			       generate_subscripts($2::uuid[], 1) AS order_id
		)
		INSERT INTO songs_artists(song_id, artist_uuid, order_id)
		SELECT song_id, artist_uuid, order_id FROM input
		ON CONFLICT (song_id, artist_uuid) 
		DO UPDATE SET order_id = EXCLUDED.order_id;
	`, song.UniqueFileId, pq.Array(artistsUuids))
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (s *SongsStorage) AddSongsToPlaylist(ctx context.Context, playlistUuid string, songIds ...string) error {
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
`, playlistUuid, pq.StringArray(songIds))
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}
func (s *SongsStorage) List(ctx context.Context, r domain.ListSongs) ([]domain.SongBase, error) {
	if r.PlaylistUuid == nil {
		return nil, rerrors.New("no playlist uuid is passed to list songs")
	}

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

func (s *SongsStorage) Get(ctx context.Context, uniqueId string) (domain.SongBase, error) {
	songRow, err := s.querier.GetSongByUniqueId(ctx, uniqueId)
	if err != nil {
		return domain.SongBase{}, wrapPgErr(err)
	}

	song := domain.SongBase{
		UniqueFileId: songRow.FileID,
		Title:        songRow.Title,
		Duration:     time.Duration(songRow.DurationSec) * time.Second,
	}

	err = json.Unmarshal(songRow.Artists, &song.Artists)
	if err != nil {
		return song, rerrors.Wrap(err, "error unmarshalling artists from storage to model")
	}

	return song, nil
}

func (s *SongsStorage) Delete(ctx context.Context, fileUniqueId string) error {
	_, err := s.db.ExecContext(ctx, `
			DELETE FROM files_meta
			WHERE tg_unique_id = $1`, fileUniqueId)
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
