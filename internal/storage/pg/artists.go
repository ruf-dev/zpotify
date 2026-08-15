package pg

import (
	"context"
	"database/sql"

	sq "github.com/Masterminds/squirrel"
	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/artists_q"
	"go.zpotify.ru/zpotify/internal/utils"
)

const (
	artistUuidColumn = "uuid"
	artistNameColumn = "name"
)

type ArtistsStorage struct {
	db      sqldb.DB
	querier artists_q.Querier
}

func NewArtistsStorage(db sqldb.DB) *ArtistsStorage {
	return &ArtistsStorage{
		db:      db,
		querier: artists_q.New(db),
	}
}

func (a *ArtistsStorage) Return(ctx context.Context, artistsNames []string) ([]domain.ArtistsBase, error) {
	listReq := domain.ListArtists{
		Name: artistsNames,
	}

	artists, err := a.List(ctx, listReq)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	if len(artists) == len(artistsNames) {
		return artists, nil
	}

	coolArtistsByName := make(map[string]domain.ArtistsBase, len(artists))

	for _, art := range artists {
		coolArtistsByName[art.Name] = art
	}

	artistsToAdd := make([]domain.ArtistsBase, 0, len(artistsNames)-len(artists))

	for _, artName := range artistsNames {
		_, isCool := coolArtistsByName[artName]
		if isCool {
			continue
		}

		artistsToAdd = append(artistsToAdd, domain.ArtistsBase{
			Name: artName,
		})
	}

	upsertedArtists, err := a.Upsert(ctx, artistsToAdd)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	artists = append(artists, upsertedArtists...)

	return artists, nil
}

func (a *ArtistsStorage) Upsert(ctx context.Context, artists []domain.ArtistsBase) ([]domain.ArtistsBase, error) {
	builder := sq.Insert("artists").
		Columns(artistNameColumn).
		Suffix("returning uuid, name").
		PlaceholderFormat(sq.Dollar)

	for _, art := range artists {
		builder = builder.Values(art.Name)
	}

	query, args, err := builder.ToSql()
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	scnr, err := a.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, wrapPgErr(err)
	}

	defer utils.CloseWithLog(scnr, "artists insert scanner")

	res := make([]domain.ArtistsBase, 0, len(artists))
	for scnr.Next() {
		var artist domain.ArtistsBase
		err = scnr.Scan(
			&artist.Uuid,
			&artist.Name,
		)
		if err != nil {
			return nil, wrapPgErr(err)
		}

		res = append(res, artist)
	}

	err = scnr.Err()
	if err != nil {
		return nil, wrapPgErr(err)
	}

	return res, nil
}

func (a *ArtistsStorage) List(ctx context.Context, req domain.ListArtists) ([]domain.ArtistsBase, error) {
	columns := []string{artistUuidColumn, artistNameColumn}
	if req.UserId != 0 {
		columns = append(columns, "(ua.user_id IS NOT NULL) AS liked")
	}

	builder := sq.Select().
		Columns(columns...).
		From("artists").
		PlaceholderFormat(sq.Dollar)
	builder = a.applyListQueryFilters(builder, req)

	if req.Limit > 0 {
		builder = builder.Limit(req.Limit)
	}
	if req.Offset > 0 {
		builder = builder.Offset(req.Offset)
	}

	query, args, err := builder.ToSql()
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	rows, err := a.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}
	defer utils.CloseWithLog(rows, "artists list rows")

	out := make([]domain.ArtistsBase, 0)
	for rows.Next() {
		var artist domain.ArtistsBase

		if req.UserId != 0 {
			err = rows.Scan(
				&artist.Uuid,
				&artist.Name,
				&artist.Liked,
			)
		} else {
			err = rows.Scan(
				&artist.Uuid,
				&artist.Name,
			)
		}
		if err != nil {
			return nil, rerrors.Wrap(err)
		}
		out = append(out, artist)
	}

	err = rows.Err()
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return out, nil
}

func (a *ArtistsStorage) applyListQueryFilters(builder sq.SelectBuilder, listReq domain.ListArtists) sq.SelectBuilder {
	if len(listReq.Uuid) > 0 {
		builder = builder.Where(sq.Eq{artistUuidColumn: listReq.Uuid})
	}

	if len(listReq.Name) > 0 {
		builder = builder.Where(sq.Eq{artistNameColumn: listReq.Name})
	}

	if listReq.Search != nil && *listReq.Search != "" {
		builder = builder.Where(sq.ILike{artistNameColumn: "%" + *listReq.Search + "%"})
	}

	if listReq.UserId != 0 {
		builder = builder.LeftJoin("user_artists ua ON ua.artist_id = artists.uuid AND ua.user_id = ?", listReq.UserId)

		if listReq.OnlyLiked {
			builder = builder.Where(sq.Expr("ua.user_id IS NOT NULL"))
		}
	}

	return builder
}

func (a *ArtistsStorage) Get(ctx context.Context, artistUuid string, userId int64) (domain.Artist, error) {
	columns := []string{artistUuidColumn, artistNameColumn, "avatar_file_id", "background_cover_file_id"}
	if userId != 0 {
		columns = append(columns, "(ua.user_id IS NOT NULL) AS liked")
	}

	builder := sq.Select().
		Columns(columns...).
		From("artists").
		Where(sq.Eq{artistUuidColumn: artistUuid}).
		PlaceholderFormat(sq.Dollar)

	if userId != 0 {
		builder = builder.LeftJoin("user_artists ua ON ua.artist_id = artists.uuid AND ua.user_id = ?", userId)
	}

	query, args, err := builder.ToSql()
	if err != nil {
		return domain.Artist{}, rerrors.Wrap(err)
	}

	var artist domain.Artist
	var avatarFileId, backgroundCoverFileId sql.NullInt64

	row := a.db.QueryRowContext(ctx, query, args...)
	if userId != 0 {
		err = row.Scan(&artist.Uuid, &artist.Name, &avatarFileId, &backgroundCoverFileId, &artist.Liked)
	} else {
		err = row.Scan(&artist.Uuid, &artist.Name, &avatarFileId, &backgroundCoverFileId)
	}
	if err != nil {
		return domain.Artist{}, wrapPgErr(err)
	}

	if avatarFileId.Valid {
		artist.AvatarFileId = &avatarFileId.Int64
	}

	if backgroundCoverFileId.Valid {
		artist.BackgroundCoverFileId = &backgroundCoverFileId.Int64
	}

	return artist, nil
}

func (a *ArtistsStorage) Update(ctx context.Context, params domain.UpdateArtistParams) error {
	if params.Name == "" {
		return nil
	}

	builder := sq.Update("artists").
		Set(artistNameColumn, params.Name).
		Where(sq.Eq{artistUuidColumn: params.Uuid}).
		PlaceholderFormat(sq.Dollar)

	query, args, err := builder.ToSql()
	if err != nil {
		return rerrors.Wrap(err)
	}

	_, err = a.db.ExecContext(ctx, query, args...)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (a *ArtistsStorage) UpdateAvatarFileId(ctx context.Context, artistUuid string, fileId int64) error {
	builder := sq.Update("artists").
		Set("avatar_file_id", fileId).
		Where(sq.Eq{artistUuidColumn: artistUuid}).
		PlaceholderFormat(sq.Dollar)

	query, args, err := builder.ToSql()
	if err != nil {
		return rerrors.Wrap(err)
	}

	_, err = a.db.ExecContext(ctx, query, args...)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (a *ArtistsStorage) UpdateBackgroundCoverFileId(ctx context.Context, artistUuid string, fileId int64) error {
	builder := sq.Update("artists").
		Set("background_cover_file_id", fileId).
		Where(sq.Eq{artistUuidColumn: artistUuid}).
		PlaceholderFormat(sq.Dollar)

	query, args, err := builder.ToSql()
	if err != nil {
		return rerrors.Wrap(err)
	}

	_, err = a.db.ExecContext(ctx, query, args...)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (a *ArtistsStorage) LikeArtist(ctx context.Context, userId int64, artistUuid string) error {
	parsedUuid, err := uuid.Parse(artistUuid)
	if err != nil {
		return rerrors.Wrap(err, "error parsing artist uuid")
	}

	params := artists_q.LikeArtistParams{
		UserID:   userId,
		ArtistID: parsedUuid,
	}

	err = a.querier.LikeArtist(ctx, params)
	if err != nil {
		return rerrors.Wrap(err, "error liking artist")
	}

	return nil
}

func (a *ArtistsStorage) UnlikeArtist(ctx context.Context, userId int64, artistUuid string) error {
	parsedUuid, err := uuid.Parse(artistUuid)
	if err != nil {
		return rerrors.Wrap(err, "error parsing artist uuid")
	}

	params := artists_q.UnlikeArtistParams{
		UserID:   userId,
		ArtistID: parsedUuid,
	}

	err = a.querier.UnlikeArtist(ctx, params)
	if err != nil {
		return rerrors.Wrap(err, "error unliking artist")
	}

	return nil
}

func (a *ArtistsStorage) Search(ctx context.Context, query string, limit, offset uint64) ([]domain.ArtistSearchResult, error) {
	tsQuery := toPrefixTSQuery(query)
	if tsQuery == "" {
		return []domain.ArtistSearchResult{}, nil
	}

	params := artists_q.SearchArtistsByNameParams{
		Query:  tsQuery,
		Limit:  int32(limit),
		Offset: int32(offset),
	}

	rows, err := a.querier.SearchArtistsByName(ctx, params)
	if err != nil {
		return nil, wrapPgErr(err)
	}

	artists := make([]domain.ArtistSearchResult, len(rows))
	for i, row := range rows {
		artists[i] = domain.ArtistSearchResult{
			ArtistsBase: domain.ArtistsBase{
				Uuid:      row.Uuid.String(),
				Name:      row.Name,
				CreatedAt: row.CreatedAt,
			},
			AvatarFilePath: row.AvatarFilePath.String,
			Score:          float64(row.Score),
		}
	}

	return artists, nil
}

func (a *ArtistsStorage) WithTx(tx *sql.Tx) storage.ArtistStorage {
	return &ArtistsStorage{
		db:      &txWrapper{tx},
		querier: artists_q.New(tx),
	}
}
