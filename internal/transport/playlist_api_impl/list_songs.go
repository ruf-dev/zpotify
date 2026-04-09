package playlist_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) ListSongs(ctx context.Context, req *zpotify_api.ListSongs_Request) (
	*zpotify_api.ListSongs_Response, error) {
	listReq := domain.ListSongs{
		ListSongsFilters: domain.ListSongsFilters{
			PlaylistUuid: req.PlaylistUuid,
		},

		Limit:      req.GetPaging().GetLimit(),
		Offset:     req.GetPaging().GetOffset(),
		RandomHash: req.RandomHash,

		OrderBy: domain.SongsOrderByOrderNumber,
		Desc:    true,
	}

	list, err := impl.playlistService.ListSongs(ctx, listReq)
	if err != nil {
		return nil, rerrors.Wrap(err, "Unable to list songs in playlist")
	}

	return &zpotify_api.ListSongs_Response{
		Songs: toSongs(list.Songs),
		Total: uint32(list.Total),
	}, nil
}

func toSongs(base []domain.PlaylistSong) []*zpotify_api.SongBase {
	out := make([]*zpotify_api.SongBase, 0, len(base))

	for _, b := range base {
		out = append(out, toSong(b))
	}

	return out
}

func toSong(base domain.PlaylistSong) *zpotify_api.SongBase {
	return &zpotify_api.SongBase{
		Id:          int64(base.Id),
		Title:       base.Title,
		Artists:     toArtists(base.Artists),
		DurationSec: int32(base.Duration.Seconds()),
		FilePath:    base.FilePath,
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
