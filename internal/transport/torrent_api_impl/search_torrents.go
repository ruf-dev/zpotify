package torrent_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"
	"google.golang.org/protobuf/types/known/timestamppb"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) SearchTorrents(ctx context.Context, req *zpotify_api.SearchTorrents_Request) (*zpotify_api.SearchTorrents_Response, error) {
	results, err := impl.torrentSearchService.Search(ctx, req.Query)
	if err != nil {
		return nil, rerrors.Wrap(err, "error searching torrents")
	}

	resp := &zpotify_api.SearchTorrents_Response{
		Results: make([]*zpotify_api.TorrentSearchResult, 0, len(results)),
	}
	for _, result := range results {
		resp.Results = append(resp.Results, toTorrentSearchResult(result))
	}

	return resp, nil
}

func toTorrentSearchResult(result domain.TorrentSearchResult) *zpotify_api.TorrentSearchResult {
	apiResult := &zpotify_api.TorrentSearchResult{
		Id:                result.Id,
		Title:             result.Title,
		SizeBytes:         result.SizeBytes,
		Indexer:           result.Indexer,
		PublishedAt:       timestamppb.New(result.PublishedAt),
		IsAlreadyImported: result.IsAlreadyImported,
	}

	return apiResult
}
