package zpotify_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/pkg/zpotify_api"
)

func (impl *Impl) CreatePlaylist(ctx context.Context, req *zpotify_api.CreatePlaylist_Request) (
	*zpotify_api.CreatePlaylist_Response, error) {
	params := domain.CreatePlaylistParams{
		Name:        req.Name,
		Description: req.GetDescription(),
	}

	playlist, err := impl.playlistService.Create(ctx, params)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return &zpotify_api.CreatePlaylist_Response{
		Uuid: playlist.Uuid,
	}, nil
}
