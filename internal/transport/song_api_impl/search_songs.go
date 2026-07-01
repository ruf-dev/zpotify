package song_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) SearchSongs(ctx context.Context, req *zpotify_api.SearchSongs_Request) (*zpotify_api.SearchSongs_Response, error) {
	params := domain.SearchSongsParams{
		Query: req.GetQuery(),
	}

	paging := req.GetPaging()
	if paging != nil {
		params.Limit = paging.GetLimit()
		params.Offset = paging.GetOffset()
	}

	songs, err := impl.audioService.Search(ctx, params)
	if err != nil {
		return nil, rerrors.Wrap(err, "error searching songs")
	}

	protoSongs := make([]*zpotify_api.SongBase, len(songs))
	for i, song := range songs {
		protoSongs[i] = domainSongToProto(song)
	}

	resp := &zpotify_api.SearchSongs_Response{
		Songs: protoSongs,
	}

	return resp, nil
}
