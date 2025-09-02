package zpotify_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/pkg/zpotify_api"
)

func (impl *Impl) ListSongs(ctx context.Context, req *zpotify_api.ListSongs_Request) (
	*zpotify_api.ListSongs_Response, error) {
	listReq := domain.ListSongs{
		Limit:  req.GetPaging().GetLimit(),
		Offset: req.GetPaging().GetOffset(),
	}

	list, err := impl.audioService.List(ctx, listReq)
	if err != nil {
		return nil, rerrors.Wrap(err, "Unable to list audio")
	}

	return &zpotify_api.ListSongs_Response{
		Songs: toSongs(list.Songs),
	}, nil
}

func toSongs(base []domain.SongBase) []*zpotify_api.SongBase {
	out := make([]*zpotify_api.SongBase, 0, len(base))

	for _, b := range base {
		out = append(out, toSong(b))
	}

	return out
}

func toSong(base domain.SongBase) *zpotify_api.SongBase {
	return &zpotify_api.SongBase{
		UniqueId:    base.UniqueFileId,
		Title:       base.Title,
		Artists:     toArtists(base.Artists),
		DurationSec: int32(base.Duration.Seconds()),
	}
}

func toArtists(artists []domain.ArtistsBase) []*zpotify_api.ArtistBase {
	res := make([]*zpotify_api.ArtistBase, 0, len(artists))

	for _, artist := range artists {
		res = append(res, toArtist(artist))
	}

	return res
}

func toArtist(base domain.ArtistsBase) *zpotify_api.ArtistBase {
	return &zpotify_api.ArtistBase{
		Name: base.Name,
	}
}
