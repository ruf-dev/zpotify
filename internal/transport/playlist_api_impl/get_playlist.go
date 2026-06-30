package playlist_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) GetPlaylist(ctx context.Context, req *zpotify_api.GetPlaylist_Request) (*zpotify_api.GetPlaylist_Response, error) {
	playlist, err := impl.playlistService.Get(ctx, req.Uuid)
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting playlist")
	}

	protoPlaylist := toPlaylist(playlist)
	return &zpotify_api.GetPlaylist_Response{Playlist: protoPlaylist}, nil
}
