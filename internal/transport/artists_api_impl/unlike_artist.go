package artists_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) UnlikeArtist(ctx context.Context, request *zpotify_api.UnlikeArtist_Request) (*zpotify_api.UnlikeArtist_Response, error) {
	err := impl.artistsService.UnlikeArtist(ctx, request.ArtistUuid)
	if err != nil {
		return nil, rerrors.Wrap(err, "error unliking artist")
	}

	return &zpotify_api.UnlikeArtist_Response{}, nil
}
