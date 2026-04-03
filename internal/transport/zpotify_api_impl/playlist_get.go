package zpotify_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) GetPlaylist(ctx context.Context, req *zpotify_api.GetPlaylist_Request) (
	*zpotify_api.GetPlaylist_Response, error) {
	playlist, err := impl.playlistService.Get(ctx, req.Uuid)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return &zpotify_api.GetPlaylist_Response{
		Playlist: toPgPlaylist(playlist),
	}, nil
}

func toPgPlaylist(pl domain.Playlist) *zpotify_api.Playlist {
	out := &zpotify_api.Playlist{
		Uuid:     pl.Uuid,
		Name:     pl.Name,
		IsPublic: pl.IsPublic,
	}

	if pl.Description != "" {
		out.Description = &pl.Description
	}

	return out
}
