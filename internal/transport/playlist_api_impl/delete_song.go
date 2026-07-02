package playlist_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) DeleteSong(ctx context.Context, req *zpotify_api.DeleteSong_Request) (*zpotify_api.DeleteSong_Response, error) {
	deleteReq := domain.DeleteSongFromPlaylist{
		PlaylistUuid: req.PlaylistUuid,
		SongId:       req.SongId,
	}

	err := impl.playlistService.DeleteSong(ctx, deleteReq)
	if err != nil {
		return nil, rerrors.Wrap(err, "error deleting song from playlist")
	}

	return &zpotify_api.DeleteSong_Response{}, nil
}
