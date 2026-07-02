package playlist_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) UnfollowPlaylist(ctx context.Context, req *zpotify_api.UnfollowPlaylist_Request) (*zpotify_api.UnfollowPlaylist_Response, error) {
	err := impl.playlistService.Unfollow(ctx, req.PlaylistUuid)
	if err != nil {
		return nil, rerrors.Wrap(err, "error unfollowing playlist")
	}

	return &zpotify_api.UnfollowPlaylist_Response{}, nil
}
