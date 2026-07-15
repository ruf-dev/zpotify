package pg

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/home_q"
	"go.zpotify.ru/zpotify/internal/utils"
)

const createdAtDateColumn = "created_at::date"

type HomeStorage struct {
	db      sqldb.DB
	querier home_q.Querier

	playlistStorage storage.PlaylistStorage
}

func NewHomeStorage(db sqldb.DB, playlistStorage storage.PlaylistStorage) *HomeStorage {
	return &HomeStorage{
		db:      db,
		querier: home_q.New(db),

		playlistStorage: playlistStorage,
	}
}

func (h *HomeStorage) ListFeedDays(ctx context.Context, limit, offset uint64) ([]time.Time, uint32, error) {
	params := home_q.ListFeedDaysParams{
		Limit:  int32(limit),
		Offset: int32(offset),
	}

	days, err := h.querier.ListFeedDays(ctx, params)
	if err != nil {
		return nil, 0, rerrors.Wrap(err, "error listing feed days")
	}

	total, err := h.querier.CountFeedDays(ctx)
	if err != nil {
		return nil, 0, rerrors.Wrap(err, "error counting feed days")
	}

	return days, uint32(total), nil
}

func (h *HomeStorage) ListPlaylistsByDays(ctx context.Context, days []time.Time) ([]domain.Playlist, error) {
	builder := sq.Select(
		"uuid",
		"name",
		"description",
		"is_public",
		"cover_file_id",
		"song_count",
		"year",
		"created_at",
	).
		From("playlists_v3").
		Where(sq.Eq{"is_public": true}).
		Where(sq.Eq{createdAtDateColumn: days}).
		PlaceholderFormat(sq.Dollar)

	querySql, args, err := builder.ToSql()
	if err != nil {
		return nil, rerrors.Wrap(err, "error building list feed playlists query")
	}

	rows, err := h.db.QueryContext(ctx, querySql, args...)
	if err != nil {
		return nil, wrapPgErr(err)
	}
	defer utils.CloseWithLog(rows, "feed playlists rows")

	var playlists []domain.Playlist
	for rows.Next() {
		var (
			id          uuid.UUID
			name        string
			description string
			isPublic    bool
			coverFileID sql.NullInt64
			songCount   int32
			year        sql.NullInt32
			createdAt   time.Time
		)

		err = rows.Scan(&id, &name, &description, &isPublic, &coverFileID, &songCount, &year, &createdAt)
		if err != nil {
			return nil, wrapPgErr(err)
		}

		playlist := domain.Playlist{
			Uuid:        id.String(),
			Name:        name,
			Description: description,
			IsPublic:    isPublic,
			SongCount:   &songCount,
			CreatedAt:   createdAt,
		}

		if coverFileID.Valid {
			playlist.CoverFileId = &coverFileID.Int64
		}

		if year.Valid {
			playlist.Year = &year.Int32
		}

		artists, artistsErr := h.playlistStorage.GetPlaylistArtists(ctx, id.String())
		if artistsErr != nil {
			return nil, rerrors.Wrap(artistsErr, "error getting playlist artists")
		}
		playlist.Artists = artists

		playlists = append(playlists, playlist)
	}

	err = rows.Err()
	if err != nil {
		return nil, wrapPgErr(err)
	}

	return playlists, nil
}

func (h *HomeStorage) ListSongsByDays(ctx context.Context, days []time.Time) ([]domain.FeedSong, error) {
	builder := sq.Select(
		"id",
		"title",
		"created_at",
		"duration_sec",
		"file_path",
		"file_id",
		"artist_info",
		"cover_file_path",
	).
		From("song_search_view_v2").
		Where(sq.Eq{createdAtDateColumn: days}).
		PlaceholderFormat(sq.Dollar)

	querySql, args, err := builder.ToSql()
	if err != nil {
		return nil, rerrors.Wrap(err, "error building list feed songs query")
	}

	rows, err := h.db.QueryContext(ctx, querySql, args...)
	if err != nil {
		return nil, wrapPgErr(err)
	}
	defer utils.CloseWithLog(rows, "feed songs rows")

	var songs []domain.FeedSong
	for rows.Next() {
		var (
			id              int64
			title           string
			createdAt       time.Time
			durationSeconds int64
			filePath        string
			fileID          int64
			artistInfoJson  json.RawMessage
			coverFilePath   sql.NullString
		)

		err = rows.Scan(&id, &title, &createdAt, &durationSeconds, &filePath, &fileID, &artistInfoJson, &coverFilePath)
		if err != nil {
			return nil, wrapPgErr(err)
		}

		var artists []domain.ArtistsBase
		err = json.Unmarshal(artistInfoJson, &artists)
		if err != nil {
			return nil, rerrors.Wrap(err, "error unmarshalling artists info from storage json")
		}

		song := domain.FeedSong{
			SongBase: domain.SongBase{
				Id:            id,
				Title:         title,
				Duration:      time.Duration(durationSeconds) * time.Second,
				FilePath:      filePath,
				FileId:        fileID,
				CoverFilePath: coverFilePath.String,
			},
			Artists:   artists,
			CreatedAt: createdAt,
		}

		songs = append(songs, song)
	}

	err = rows.Err()
	if err != nil {
		return nil, wrapPgErr(err)
	}

	return songs, nil
}

func (h *HomeStorage) ListArtistsByDays(ctx context.Context, days []time.Time) ([]domain.ArtistsBase, error) {
	builder := sq.Select("uuid", "name", "created_at").
		From("artists").
		Where(sq.Eq{createdAtDateColumn: days}).
		PlaceholderFormat(sq.Dollar)

	querySql, args, err := builder.ToSql()
	if err != nil {
		return nil, rerrors.Wrap(err, "error building list feed artists query")
	}

	rows, err := h.db.QueryContext(ctx, querySql, args...)
	if err != nil {
		return nil, wrapPgErr(err)
	}
	defer utils.CloseWithLog(rows, "feed artists rows")

	var artists []domain.ArtistsBase
	for rows.Next() {
		var (
			id        uuid.UUID
			name      string
			createdAt time.Time
		)

		err = rows.Scan(&id, &name, &createdAt)
		if err != nil {
			return nil, wrapPgErr(err)
		}

		artist := domain.ArtistsBase{
			Uuid:      id.String(),
			Name:      name,
			CreatedAt: createdAt,
		}

		artists = append(artists, artist)
	}

	err = rows.Err()
	if err != nil {
		return nil, wrapPgErr(err)
	}

	return artists, nil
}

func (h *HomeStorage) WithTx(tx *sql.Tx) storage.HomeStorage {
	return &HomeStorage{
		db:      &txWrapper{tx},
		querier: home_q.New(tx),

		playlistStorage: h.playlistStorage.WithTx(tx),
	}
}
