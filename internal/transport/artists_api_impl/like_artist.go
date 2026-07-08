package artists_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) LikeArtist(ctx context.Context, request *zpotify_api.LikeArtist_Request) (*zpotify_api.LikeArtist_Response, error) {
	err := impl.artistsService.LikeArtist(ctx, request.ArtistUuid)
	if err != nil {
		return nil, rerrors.Wrap(err, "error liking artist")
	}

	return &zpotify_api.LikeArtist_Response{}, nil
}
