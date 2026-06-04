package playlist_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"
	"go.redsock.ru/toolbox"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) GetPlaylist(ctx context.Context, req *zpotify_api.GetPlaylist_Request) (*zpotify_api.GetPlaylist_Response, error) {
	playlist, err := impl.playlistService.Get(ctx, req.Uuid)
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting playlist")
	}

	protoArtists := make([]*zpotify_api.ArtistBase, 0, len(playlist.Artists))
	for _, a := range playlist.Artists {
		artist := &zpotify_api.ArtistBase{
			Uuid: a.Uuid,
			Name: a.Name,
		}
		protoArtists = append(protoArtists, artist)
	}

	protoPlaylist := &zpotify_api.Playlist{
		Uuid:        playlist.Uuid,
		Name:        playlist.Name,
		Description: toolbox.ToPtr(playlist.Description),
		IsPublic:    playlist.IsPublic,
		Artists:     protoArtists,
		CoverFileId: playlist.CoverFileId,
	}

	return &zpotify_api.GetPlaylist_Response{Playlist: protoPlaylist}, nil
}
