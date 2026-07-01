package playlist_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) AddSongsToPlaylist(ctx context.Context, req *zpotify_api.AddSongsToPlaylist_Request) (*zpotify_api.AddSongsToPlaylist_Response, error) {
	addReq := domain.AddSongsToPlaylist{
		PlaylistUuid: req.PlaylistUuid,
		SongIds:      req.SongIds,
	}

	err := impl.playlistService.AddSongs(ctx, addReq)
	if err != nil {
		return nil, rerrors.Wrap(err, "error adding songs to playlist")
	}

	return &zpotify_api.AddSongsToPlaylist_Response{}, nil
}
