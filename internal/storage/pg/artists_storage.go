package pg

import (
	"context"
	"database/sql"

	sq "github.com/Masterminds/squirrel"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

type ArtistsStorage struct {
	db sqldb.DB
}

func NewArtistsStorage(db sqldb.DB) *ArtistsStorage {
	return &ArtistsStorage{
		db: db,
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
		Columns("name").
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

	defer scnr.Close()

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

	return res, nil
}

func (a *ArtistsStorage) List(ctx context.Context, req domain.ListArtists) ([]domain.ArtistsBase, error) {
	builder := sq.Select().
		Columns(
			"uuid",
			"name").
		From("artists").
		PlaceholderFormat(sq.Dollar)
	// TODO add paging
	builder = a.applyListQueryFilters(builder, req)

	query, args, err := builder.ToSql()
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	rows, err := a.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}
	defer rows.Close()

	out := make([]domain.ArtistsBase, 0)
	for rows.Next() {
		var artist domain.ArtistsBase

		err = rows.Scan(
			&artist.Uuid,
			&artist.Name,
		)
		if err != nil {
			return nil, rerrors.Wrap(err)
		}
		out = append(out, artist)
	}

	return out, nil
}

func (a *ArtistsStorage) applyListQueryFilters(builder sq.SelectBuilder, listReq domain.ListArtists) sq.SelectBuilder {
	for _, name := range listReq.Name {
		builder = builder.Where(sq.ILike{"name": name})
	}

	return builder
}

func (a *ArtistsStorage) WithTx(tx *sql.Tx) storage.ArtistStorage {
	return NewArtistsStorage(tx)
}
