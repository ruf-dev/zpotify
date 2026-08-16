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
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/songs_q"
	"go.zpotify.ru/zpotify/internal/utils"
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

func (s *SongsStorage) SearchByTitle(ctx context.Context, query string, userId int64, limit, offset uint64) ([]domain.Song, error) {
	tsQuery := toPrefixTSQuery(query)
	if tsQuery == "" {
		return []domain.Song{}, nil
	}

	params := songs_q.SearchSongsByTitleParams{
		Query:  tsQuery,
		UserID: userId,
		Limit:  int32(limit),
		Offset: int32(offset),
	}

	rows, err := s.querier.SearchSongsByTitle(ctx, params)
	if err != nil {
		return nil, wrapPgErr(err)
	}

	songs := make([]domain.Song, len(rows))
	for i, row := range rows {
		var artists []domain.ArtistsBase
		err = json.Unmarshal(row.ArtistInfo, &artists)
		if err != nil {
			return nil, rerrors.Wrap(err, "error unmarshalling artists info from storage json")
		}

		songs[i] = domain.Song{
			SongBase:          toSongBaseFromSearch(row),
			Artists:           artists,
			Score:             float64(row.Score),
			ContainerPlaylist: toContainerPlaylist(row),
		}
	}

	return songs, nil
}

func toContainerPlaylist(row songs_q.SearchSongsByTitleRow) *domain.ContainerPlaylist {
	if !row.ContainerPlaylistUuid.Valid {
		return nil
	}

	container := domain.ContainerPlaylist{
		Uuid:    row.ContainerPlaylistUuid.UUID.String(),
		Name:    row.ContainerPlaylistName.String,
		IsAlbum: row.ContainerIsAlbum.Bool,
	}

	return &container
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
	defer utils.CloseWithLog(rows, "songs batch insert rows")

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

func (s *SongsStorage) GetSongTags(ctx context.Context, songId int64) ([]domain.SongTag, error) {
	rows, err := s.querier.GetSongTags(ctx, songId)
	if err != nil {
		return nil, wrapPgErr(err)
	}

	tags := make([]domain.SongTag, 0, len(rows))
	for _, row := range rows {
		tag := domain.SongTag{
			Kind:  row.Kind,
			Value: row.Value,
		}
		tags = append(tags, tag)
	}

	return tags, nil
}

func (s *SongsStorage) InsertSongTag(ctx context.Context, songId int64, tag domain.SongTag, orderId int) error {
	insertParams := songs_q.InsertSongTagParams{
		SongID:  songId,
		Kind:    tag.Kind,
		Value:   tag.Value,
		OrderID: int64(orderId),
	}

	err := s.querier.InsertSongTag(ctx, insertParams)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (s *SongsStorage) ClearSongTags(ctx context.Context, songId int64) error {
	err := s.querier.ClearSongTags(ctx, songId)
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

func (s *SongsStorage) ListByArtist(ctx context.Context, req domain.ListSongsByArtist) ([]domain.Song, error) {
	artistUuid, err := uuid.Parse(req.ArtistUuid)
	if err != nil {
		return nil, rerrors.Wrap(err, "error parsing artist uuid")
	}

	switch {
	case req.Role == domain.ArtistSongRolePrimary && req.StandaloneOnly:
		return s.listArtistPrimarySongs(ctx, artistUuid, req.Limit)
	case req.Role == domain.ArtistSongRoleFeatured:
		return s.listArtistFeaturedSongs(ctx, artistUuid, req.Limit)
	default:
		return nil, rerrors.New("unsupported ListSongsByArtist combination of role and standalone_only")
	}
}

func (s *SongsStorage) listArtistPrimarySongs(ctx context.Context, artistUuid uuid.UUID, limit uint64) ([]domain.Song, error) {
	params := songs_q.ListArtistPrimarySongsParams{
		ArtistUuid: artistUuid,
		Limit:      int32(limit),
	}

	rows, err := s.querier.ListArtistPrimarySongs(ctx, params)
	if err != nil {
		return nil, wrapPgErr(err)
	}

	songs := make([]domain.Song, len(rows))
	for i, row := range rows {
		var artists []domain.ArtistsBase
		err = json.Unmarshal(row.ArtistInfo, &artists)
		if err != nil {
			return nil, rerrors.Wrap(err, "error unmarshalling artists info from storage json")
		}

		songs[i] = domain.Song{
			SongBase: toSongBaseFromArtistPrimary(row),
			Artists:  artists,
		}
	}

	return songs, nil
}

func (s *SongsStorage) listArtistFeaturedSongs(ctx context.Context, artistUuid uuid.UUID, limit uint64) ([]domain.Song, error) {
	params := songs_q.ListArtistFeaturedSongsParams{
		ArtistUuid: artistUuid,
		Limit:      int32(limit),
	}

	rows, err := s.querier.ListArtistFeaturedSongs(ctx, params)
	if err != nil {
		return nil, wrapPgErr(err)
	}

	songs := make([]domain.Song, len(rows))
	for i, row := range rows {
		var artists []domain.ArtistsBase
		err = json.Unmarshal(row.ArtistInfo, &artists)
		if err != nil {
			return nil, rerrors.Wrap(err, "error unmarshalling artists info from storage json")
		}

		songs[i] = domain.Song{
			SongBase: toSongBaseFromArtistFeatured(row),
			Artists:  artists,
		}
	}

	return songs, nil
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

func toSongBaseFromSearch(song songs_q.SearchSongsByTitleRow) domain.SongBase {
	return domain.SongBase{
		Id:            song.ID,
		Title:         song.Title,
		Duration:      time.Duration(song.DurationSec) * time.Second,
		FilePath:      song.FilePath,
		FileId:        song.FileID,
		CoverFilePath: song.CoverFilePath.String,
	}
}

func toSongBaseFromArtistPrimary(song songs_q.ListArtistPrimarySongsRow) domain.SongBase {
	return domain.SongBase{
		Id:            song.ID,
		Title:         song.Title,
		Duration:      time.Duration(song.DurationSec) * time.Second,
		FilePath:      song.FilePath,
		FileId:        song.FileID,
		CoverFilePath: song.CoverFilePath.String,
	}
}

func toSongBaseFromArtistFeatured(song songs_q.ListArtistFeaturedSongsRow) domain.SongBase {
	return domain.SongBase{
		Id:            song.ID,
		Title:         song.Title,
		Duration:      time.Duration(song.DurationSec) * time.Second,
		FilePath:      song.FilePath,
		FileId:        song.FileID,
		CoverFilePath: song.CoverFilePath.String,
	}
}
