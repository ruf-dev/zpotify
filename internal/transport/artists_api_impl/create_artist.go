package artists_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) CreateArtist(ctx context.Context, request *zpotify_api.CreateArtist_Request) (*zpotify_api.CreateArtist_Response, error) {
	artist, err := impl.artistsService.Create(ctx, request.Name)
	if err != nil {
		return nil, rerrors.Wrap(err, "error creating artist")
	}

	res := &zpotify_api.CreateArtist_Response{
		Artist: &zpotify_api.ArtistBase{
			Uuid: artist.Uuid,
			Name: artist.Name,
		},
	}

	return res, nil
}
