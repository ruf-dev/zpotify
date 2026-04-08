package pg

import (
	"context"
	"encoding/json"
	"time"

	sq "github.com/Masterminds/squirrel"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	querier "go.zpotify.ru/zpotify/internal/storage/pg/generated"
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/playlist_q"
)

type PlaylistStorage struct {
	db sqldb.DB

	querier   querier.Querier
	playlistQ playlist_q.Querier
}

func NewPlaylistStorage(db sqldb.DB) *PlaylistStorage {
	return &PlaylistStorage{
		db: db,

		querier:   querier.New(db),
		playlistQ: playlist_q.New(db),
	}
}

func (s *PlaylistStorage) ListSongs(ctx context.Context, r domain.ListSongs) ([]domain.PlaylistSong, error) {
	builder := playlistSongsQueryBuilder{
		sq.Select(
			"id",
			"title",
			"duration_sec",
			"artist_info",
		)}.
		buildSongBaseQuery().
		applyListQueryFilters(r).
		applyListQueryOrder(r).
		Limit(r.Limit).
		Offset(r.Offset)

	querySql, args, err := builder.ToSql()
	if err != nil {
		return nil, rerrors.Wrap(err, "error building query")
	}

	rows, err := s.db.QueryContext(ctx, querySql, args...)
	if err != nil {
		return nil, wrapPgErr(err)
	}

	defer closeRowScanner(rows.Close)

	var songs []domain.PlaylistSong
	for rows.Next() {
		var song domain.PlaylistSong
		var durationSeconds int64
		var artistsInfoJson json.RawMessage

		err = rows.Scan(
			&song.Id,
			&song.Title,
			&durationSeconds,
			&artistsInfoJson,
		)
		if err != nil {
			return nil, wrapPgErr(err)
		}

		song.Duration = time.Duration(durationSeconds) * time.Second

		err = json.Unmarshal(artistsInfoJson, &song.Artists)
		if err != nil {
			return nil, rerrors.Wrap(err, "error unmarshalling artists info from storage json")
		}

		songs = append(songs, song)
	}

	return songs, nil
}

func (p *PlaylistStorage) CountSongs(ctx context.Context, r domain.ListSongs) (uint16, error) {
	if r.PlaylistUuid == nil {
		return 0, rerrors.New("no playlist uuid is passed to count")
	}

	builder := playlistSongsQueryBuilder{
		sq.Select("count(*)"),
	}

	builder = builder.buildSongBaseQuery().
		applyListQueryFilters(r)

	querySql, args, err := builder.ToSql()
	if err != nil {
		return 0, rerrors.Wrap(err, "error building query")
	}
	var count uint16
	err = p.db.QueryRowContext(ctx, querySql, args...).
		Scan(&count)
	if err != nil {
		return 0, wrapPgErr(err)
	}

	return count, nil
}

type playlistSongsQueryBuilder struct {
	sq.SelectBuilder
}

func (builder playlistSongsQueryBuilder) buildSongBaseQuery() playlistSongsQueryBuilder {
	builder.SelectBuilder = builder.From("playlists_songs_v1").
		PlaceholderFormat(sq.Dollar)

	return builder
}

func (builder playlistSongsQueryBuilder) applyListQueryFilters(r domain.ListSongs) playlistSongsQueryBuilder {
	if r.PlaylistUuid != nil {
		builder.SelectBuilder = builder.Where(sq.Eq{
			"playlist_uuid": *r.PlaylistUuid,
		})
	}

	return builder
}

func (builder playlistSongsQueryBuilder) applyListQueryOrder(r domain.ListSongs) playlistSongsQueryBuilder {
	field := "order_number"

	switch {
	case r.RandomHash != nil:
		builder.SelectBuilder = builder.
			Prefix(`WITH shuffle AS (SELECT setseed(?))`, 1_000_000_000_000*(1/float64(*r.RandomHash))).
			Join("shuffle ON true")
		field = "random()"
	}

	direction := ""
	if r.Desc {
		direction = " desc"
	}

	builder.SelectBuilder = builder.OrderBy(field + direction)

	return builder
}

func (p *PlaylistStorage) Create(ctx context.Context, params querier.CreatePlaylistParams) (domain.Playlist, error) {
	playlistUuid, err := p.querier.CreatePlaylist(ctx, params)
	if err != nil {
		return domain.Playlist{}, rerrors.Wrap(err, "error saving playlist to storage")
	}

	return domain.Playlist{
		Uuid:        playlistUuid.String(),
		Name:        params.Name,
		Description: params.Description,
	}, nil
}
