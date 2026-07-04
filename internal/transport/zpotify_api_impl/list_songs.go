package zpotify_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) ListSongs(ctx context.Context, req *zpotify_api.ListSongs_Request) (
	*zpotify_api.ListSongs_Response, error) {
	listReq := domain.ListSongs{
		Limit:      req.GetPaging().GetLimit(),
		Offset:     req.GetPaging().GetOffset(),
		RandomHash: req.RandomHash,

		//TODO
		OrderBy: domain.SongsOrderByOrderNumber,
		Desc:    true,
	}

	list, err := impl.audioService.List(ctx, listReq)
	if err != nil {
		return nil, rerrors.Wrap(err, "Unable to list songs ")
	}

	return &zpotify_api.ListSongs_Response{
		Songs: toSongs(list.Songs),
		Total: uint32(list.Total),
	}, nil
}

func toSongs(base []domain.Song) []*zpotify_api.SongBase {
	out := make([]*zpotify_api.SongBase, 0, len(base))

	for _, b := range base {
		out = append(out, toSong(b))
	}

	return out
}

func toSong(base domain.Song) *zpotify_api.SongBase {
	return &zpotify_api.SongBase{
		//UniqueId: base.FileId,
		//Title:    base.Title,
		//Artists:     toArtists(base.Artists),
		//DurationSec: int32(base.Duration.Seconds()),
	}
}
