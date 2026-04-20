package playlist_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) AddSongToPlaylist(ctx context.Context, req *zpotify_api.AddSongToPlaylist_Request) (*zpotify_api.AddSongToPlaylist_Response, error) {
	addReq := domain.AddSongToPlaylist{
		PlaylistUuid: req.PlaylistUuid,
		SongId:       req.SongId,
	}

	err := impl.playlistService.AddSong(ctx, addReq)
	if err != nil {
		return nil, rerrors.Wrap(err, "error adding song to playlist")
	}

	return &zpotify_api.AddSongToPlaylist_Response{}, nil
}
