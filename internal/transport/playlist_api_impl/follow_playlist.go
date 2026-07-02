package playlist_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) FollowPlaylist(ctx context.Context, req *zpotify_api.FollowPlaylist_Request) (*zpotify_api.FollowPlaylist_Response, error) {
	err := impl.playlistService.Follow(ctx, req.PlaylistUuid)
	if err != nil {
		return nil, rerrors.Wrap(err, "error following playlist")
	}

	return &zpotify_api.FollowPlaylist_Response{}, nil
}
