package search_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"
	"google.golang.org/protobuf/types/known/timestamppb"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) ListSearchHistory(ctx context.Context, _ *zpotify_api.ListSearchHistory_Request) (*zpotify_api.ListSearchHistory_Response, error) {
	entries, err := impl.searchHistoryService.List(ctx)
	if err != nil {
		return nil, rerrors.Wrap(err, "error listing search history")
	}

	protoEntries := make([]*zpotify_api.SearchHistoryEntry, 0, len(entries))
	for _, entry := range entries {
		protoEntry := toPbSearchHistoryEntry(entry)
		protoEntries = append(protoEntries, protoEntry)
	}

	resp := &zpotify_api.ListSearchHistory_Response{
		Entries: protoEntries,
	}

	return resp, nil
}

func toPbSearchHistoryEntry(entry domain.SearchHistoryEntry) *zpotify_api.SearchHistoryEntry {
	pbEntry := &zpotify_api.SearchHistoryEntry{
		Query:           entry.Query,
		FindingType:     entry.FindingType,
		FindingId:       entry.FindingID,
		FindingName:     entry.FindingName,
		FindingCoverUrl: entry.FindingCoverUrl,
		CreatedAt:       timestamppb.New(entry.CreatedAt),
	}

	return pbEntry
}
