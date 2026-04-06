package pg

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	querier "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

type PlaylistStorage struct {
	db sqldb.DB

	querier querier.Querier
}

func NewPlaylistStorage(db sqldb.DB) *PlaylistStorage {
	return &PlaylistStorage{
		db: db,

		querier: querier.New(db),
	}
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

func (p *PlaylistStorage) GetWithAuth(ctx context.Context, q querier.GetPlaylistWithAuthParams) (domain.Playlist, error) {
	pl, err := p.querier.GetPlaylistWithAuth(ctx, q)
	if err != nil {
		return domain.Playlist{}, wrapPgErr(err)
	}

	return domain.Playlist{
		Uuid:        pl.Uuid.String(),
		Name:        pl.Name,
		Description: pl.Description,
		IsPublic:    pl.IsPublic,
	}, nil
}
