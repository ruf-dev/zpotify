package artists_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
)

func (impl *Impl) ListArtist(ctx context.Context, request *zpotify_api.ListArtist_Request) (*zpotify_api.ListArtist_Response, error) {
	req := domain.ListArtists{}

	if request.Paging != nil {
		req.Limit = request.Paging.Limit
		req.Offset = request.Paging.Offset
	}

	if request.Filters != nil {
		req.Search = request.Filters.Search

		if request.Filters.OnlyLiked != nil {
			req.OnlyLiked = *request.Filters.OnlyLiked
		}
	}

	userCtx, ok := user_context.GetUserContext(ctx)
	if ok {
		req.UserId = userCtx.UserId
	}

	artists, err := impl.artistsService.List(ctx, req)
	if err != nil {
		return nil, rerrors.Wrap(err, "error listing artists")
	}

	res := &zpotify_api.ListArtist_Response{
		Artists: make([]*zpotify_api.ArtistBase, 0, len(artists)),
	}

	for _, art := range artists {
		res.Artists = append(res.Artists, &zpotify_api.ArtistBase{
			Uuid:  art.Uuid,
			Name:  art.Name,
			Liked: art.Liked,
		})
	}

	return res, nil
}
