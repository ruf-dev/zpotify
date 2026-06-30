package playlist_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) ChangeSongsOrder(ctx context.Context, req *zpotify_api.ChangeSongsOrder_Request) (*zpotify_api.ChangeSongsOrder_Response, error) {
	params := domain.ChangeSongsOrderParams{
		PlaylistUuid: req.PlaylistUuid,
		SongIds:      req.SongIds,
	}
	err := impl.playlistService.ChangeSongsOrder(ctx, params)
	if err != nil {
		return nil, rerrors.Wrap(err, "error changing songs order")
	}

	return &zpotify_api.ChangeSongsOrder_Response{}, nil
}
