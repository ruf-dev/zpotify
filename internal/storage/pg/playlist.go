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

func (p *PlaylistStorage) Create(ctx context.Context, req domain.CreatePlaylistReq) (domain.Playlist, error) {
	params := querier.CreatePlaylistParams{
		Name:        req.Name,
		Description: req.Description,
	}

	playlistUuid, err := p.querier.CreatePlaylist(ctx, params)
	if err != nil {
		return domain.Playlist{}, rerrors.Wrap(err, "error saving playlist to storage")
	}

	return domain.Playlist{
		Uuid:        playlistUuid.String(),
		Name:        req.Name,
		Description: req.Description,
	}, nil
}
