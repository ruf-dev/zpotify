package search_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) RecordSearchFinding(ctx context.Context, req *zpotify_api.RecordSearchFinding_Request) (*zpotify_api.RecordSearchFinding_Response, error) {
	finding := domain.SearchHistoryEntry{
		FindingType:     req.GetFindingType(),
		FindingID:       req.GetFindingId(),
		FindingName:     req.GetFindingName(),
		FindingCoverUrl: req.GetFindingCoverUrl(),
	}

	err := impl.searchHistoryService.RecordFinding(ctx, req.GetQuery(), finding)
	if err != nil {
		return nil, rerrors.Wrap(err, "error recording search finding")
	}

	return &zpotify_api.RecordSearchFinding_Response{}, nil
}
