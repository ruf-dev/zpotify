package zpotify_api_impl

import (
	"context"

	"google.golang.org/protobuf/types/known/timestamppb"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) Version(_ context.Context, _ *zpotify_api.Version_Request) (*zpotify_api.Version_Response, error) {
	resp := &zpotify_api.Version_Response{
		Version:         impl.version,
		ClientTimestamp: timestamppb.Now(),
		StartedAt:       timestamppb.New(impl.startedAt),
		DevMode:         impl.devMode,
	}

	return resp, nil
}
