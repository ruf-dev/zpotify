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
	generated "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

type PlaylistStorage struct {
	db sqldb.DB

	querier *generated.Queries
}

func NewPlaylistStorage(db sqldb.DB) *PlaylistStorage {
	return &PlaylistStorage{
		db: db,

		querier: generated.New(db),
	}
}

func (s *PlaylistStorage) WithTx(tx *sql.Tx) storage.PlaylistStorage {
	return &PlaylistStorage{
		db:      &txWrapper{tx},
		querier: generated.New(tx),
	}
}

type txWrapper struct {
	*sql.Tx
}

func (w *txWrapper) Prepare(query string) (*sql.Stmt, error) {
	return nil, rerrors.New("not implemented")
}

func (w *txWrapper) Exec(query string, args ...any) (sql.Result, error) {
	return nil, rerrors.New("not implemented")
}

func (w *txWrapper) Query(query string, args ...any) (*sql.Rows, error) {
	return nil, rerrors.New("not implemented")
}

func (w *txWrapper) QueryRow(query string, args ...any) *sql.Row {
	return nil
}

func (s *PlaylistStorage) ListSongs(ctx context.Context, r domain.ListSongs) ([]domain.PlaylistSong, error) {
	builder := playlistSongsQueryBuilder{
		sq.Select(
			"id",
			"title",
			"duration_sec",
			"artist_info",
			"file_path",
			"file_id",
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
			&song.FilePath,
			&song.FileId,
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
	builder.SelectBuilder = builder.From("playlists_songs_v2").
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

func (p *PlaylistStorage) Get(ctx context.Context, userId int64, playlistUuid string) (domain.Playlist, error) {
	parsedUuid, err := uuid.Parse(playlistUuid)
	if err != nil {
		return domain.Playlist{}, rerrors.Wrap(err, "error parsing playlist uuid")
	}

	params := generated.GetPlaylistWithAuthParams{
		UserID: userId,
		Uuid:   parsedUuid,
	}

	row, err := p.querier.GetPlaylistWithAuth(ctx, params)
	if err != nil {
		return domain.Playlist{}, wrapPgErr(err)
	}

	songCount := row.SongCount
	playlist := domain.Playlist{
		Uuid:        row.Uuid.String(),
		Name:        row.Name,
		Description: row.Description,
		IsPublic:    row.IsPublic,
		SongCount:   &songCount,
	}

	if row.CoverFileID.Valid {
		playlist.CoverFileId = &row.CoverFileID.Int64
	}

	if row.CoverFilePath.Valid {
		playlist.CoverFilePath = row.CoverFilePath.String
	}

	if row.Year.Valid {
		playlist.Year = &row.Year.Int32
	}

	artists, err := p.GetPlaylistArtists(ctx, playlistUuid)
	if err != nil {
		return domain.Playlist{}, rerrors.Wrap(err, "error getting playlist artists")
	}
	playlist.Artists = artists

	return playlist, nil
}

func (p *PlaylistStorage) Create(ctx context.Context, params domain.CreatePlaylistParams, userId int64) (string, error) {
	createParams := generated.CreatePlaylistParams{
		Name:        params.Name,
		Description: params.Description,
		IsPublic:    params.IsPublic,
		UserID:      userId,
	}

	if params.Year != nil {
		createParams.Year = sql.NullInt32{Int32: *params.Year, Valid: true}
	}

	playlistUuid, err := p.querier.CreatePlaylist(ctx, createParams)
	if err != nil {
		return "", rerrors.Wrap(err, "error saving playlist to storage")
	}

	return playlistUuid.String(), nil
}

func (p *PlaylistStorage) Update(ctx context.Context, params domain.UpdatePlaylistParams) error {
	parsedUuid, err := uuid.Parse(params.Uuid)
	if err != nil {
		return rerrors.Wrap(err, "error parsing playlist uuid")
	}

	isPublic := false
	if params.IsPublic != nil {
		isPublic = *params.IsPublic
	}

	updateParams := generated.UpdatePlaylistParams{
		Uuid:     parsedUuid,
		Column2:  params.Name,
		Column3:  params.Description,
		IsPublic: isPublic,
	}

	if params.Year != nil {
		updateParams.Year = sql.NullInt32{Int32: *params.Year, Valid: true}
	}

	err = p.querier.UpdatePlaylist(ctx, updateParams)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (p *PlaylistStorage) GetPlaylistArtists(ctx context.Context, playlistUuid string) ([]domain.ArtistsBase, error) {
	parsedUuid, err := uuid.Parse(playlistUuid)
	if err != nil {
		return nil, rerrors.Wrap(err, "error parsing playlist uuid")
	}

	rows, err := p.querier.GetPlaylistArtists(ctx, parsedUuid)
	if err != nil {
		return nil, wrapPgErr(err)
	}

	artists := make([]domain.ArtistsBase, 0, len(rows))
	for _, row := range rows {
		artist := domain.ArtistsBase{
			Uuid: row.Uuid.String(),
			Name: row.Name,
		}
		artists = append(artists, artist)
	}

	return artists, nil
}

func (p *PlaylistStorage) AddPlaylistArtist(ctx context.Context, playlistUuid, artistUuid string, orderId int) error {
	pUuid, err := uuid.Parse(playlistUuid)
	if err != nil {
		return rerrors.Wrap(err, "error parsing playlist uuid")
	}

	aUuid, err := uuid.Parse(artistUuid)
	if err != nil {
		return rerrors.Wrap(err, "error parsing artist uuid")
	}

	addParams := generated.AddPlaylistArtistParams{
		PlaylistUuid: pUuid,
		ArtistUuid:   aUuid,
		OrderID:      int64(orderId),
	}

	err = p.querier.AddPlaylistArtist(ctx, addParams)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (p *PlaylistStorage) ClearPlaylistArtists(ctx context.Context, playlistUuid string) error {
	parsedUuid, err := uuid.Parse(playlistUuid)
	if err != nil {
		return rerrors.Wrap(err, "error parsing playlist uuid")
	}

	err = p.querier.ClearPlaylistArtists(ctx, parsedUuid)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (p *PlaylistStorage) GetPlaylistChips(ctx context.Context, playlistUuid string) ([]domain.PlaylistChip, error) {
	parsedUuid, err := uuid.Parse(playlistUuid)
	if err != nil {
		return nil, rerrors.Wrap(err, "error parsing playlist uuid")
	}

	rows, err := p.querier.GetPlaylistChips(ctx, parsedUuid)
	if err != nil {
		return nil, wrapPgErr(err)
	}

	chips := make([]domain.PlaylistChip, 0, len(rows))
	for _, row := range rows {
		chip := domain.PlaylistChip{
			Kind:  row.Kind,
			Value: row.Value,
		}
		chips = append(chips, chip)
	}

	return chips, nil
}

func (p *PlaylistStorage) InsertPlaylistChip(ctx context.Context, playlistUuid string, chip domain.PlaylistChip, orderId int) error {
	parsedUuid, err := uuid.Parse(playlistUuid)
	if err != nil {
		return rerrors.Wrap(err, "error parsing playlist uuid")
	}

	insertParams := generated.InsertPlaylistChipParams{
		PlaylistUuid: parsedUuid,
		Kind:         chip.Kind,
		Value:        chip.Value,
		OrderID:      int64(orderId),
	}

	err = p.querier.InsertPlaylistChip(ctx, insertParams)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (p *PlaylistStorage) ClearPlaylistChips(ctx context.Context, playlistUuid string) error {
	parsedUuid, err := uuid.Parse(playlistUuid)
	if err != nil {
		return rerrors.Wrap(err, "error parsing playlist uuid")
	}

	err = p.querier.ClearPlaylistChips(ctx, parsedUuid)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (p *PlaylistStorage) UpdateCoverFileId(ctx context.Context, playlistUuid string, coverFileId int64) error {
	parsedUuid, err := uuid.Parse(playlistUuid)
	if err != nil {
		return rerrors.Wrap(err, "error parsing playlist uuid")
	}

	updateParams := generated.UpdatePlaylistCoverFileIdParams{
		Uuid:        parsedUuid,
		CoverFileID: sql.NullInt64{Int64: coverFileId, Valid: true},
	}

	err = p.querier.UpdatePlaylistCoverFileId(ctx, updateParams)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (p *PlaylistStorage) AddSong(ctx context.Context, playlistUuid string, songId int32) error {
	pUuid, err := uuid.Parse(playlistUuid)
	if err != nil {
		return rerrors.Wrap(err, "error parsing playlist uuid")
	}
	params := generated.AddSongToPlaylistParams{
		Uuid:   pUuid,
		SongID: int64(songId),
	}
	err = p.querier.AddSongToPlaylist(ctx, params)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (p *PlaylistStorage) SetSongOrder(ctx context.Context, playlistUuid string, songId int64, orderNum int64) error {
	pUuid, err := uuid.Parse(playlistUuid)
	if err != nil {
		return rerrors.Wrap(err, "error parsing playlist uuid")
	}
	params := generated.SetSongOrderInPlaylistParams{
		PlaylistUuid: pUuid,
		SongID:       songId,
		OrderNumber:  orderNum,
	}
	err = p.querier.SetSongOrderInPlaylist(ctx, params)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (p *PlaylistStorage) List(ctx context.Context, userId int64, req domain.ListPlaylists) ([]domain.Playlist, error) {
	params := generated.ListUserPlaylistsParams{
		UserID: userId,
		Limit:  int32(req.Limit),
		Offset: int32(req.Offset),
	}

	rows, err := p.querier.ListUserPlaylists(ctx, params)
	if err != nil {
		return nil, wrapPgErr(err)
	}

	playlists := make([]domain.Playlist, 0, len(rows))
	for _, row := range rows {
		playlist := domain.Playlist{
			Uuid:        row.Uuid.String(),
			Name:        row.Name,
			Description: row.Description,
			IsPublic:    row.IsPublic,
		}

		if row.CoverFileID.Valid {
			playlist.CoverFileId = &row.CoverFileID.Int64
		}

		songCount := row.SongCount
		playlist.SongCount = &songCount

		if row.Year.Valid {
			playlist.Year = &row.Year.Int32
		}

		artists, err := p.GetPlaylistArtists(ctx, row.Uuid.String())
		if err != nil {
			return nil, rerrors.Wrap(err, "error getting playlist artists")
		}
		playlist.Artists = artists

		playlists = append(playlists, playlist)
	}

	return playlists, nil
}

func (p *PlaylistStorage) CountPlaylists(ctx context.Context, userId int64) (uint32, error) {
	count, err := p.querier.CountUserPlaylists(ctx, userId)
	if err != nil {
		return 0, wrapPgErr(err)
	}

	return uint32(count), nil
}
