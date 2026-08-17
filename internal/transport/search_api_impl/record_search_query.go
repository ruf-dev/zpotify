package search_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) RecordSearchQuery(ctx context.Context, req *zpotify_api.RecordSearchQuery_Request) (*zpotify_api.RecordSearchQuery_Response, error) {
	err := impl.searchHistoryService.RecordQuery(ctx, req.GetQuery())
	if err != nil {
		return nil, rerrors.Wrap(err, "error recording search query")
	}

	return &zpotify_api.RecordSearchQuery_Response{}, nil
}
