package feature_flags_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

var featureFlagIDToProto = map[string]zpotify_api.FeatureFlagId{
	"is_comments_on_album_enabled": zpotify_api.FeatureFlagId_IS_COMMENTS_ON_ALBUM_ENABLED,
}

func (impl *Impl) GetFeatureFlags(ctx context.Context, _ *zpotify_api.GetFeatureFlags_Request) (*zpotify_api.GetFeatureFlags_Response, error) {
	flags, err := impl.featureFlagsService.GetAll(ctx)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	protoFlags := make([]*zpotify_api.FeatureFlag, 0, len(flags))
	for _, f := range flags {
		protoFlag := toProtoFlag(f)
		protoFlags = append(protoFlags, &protoFlag)
	}

	resp := &zpotify_api.GetFeatureFlags_Response{
		Flags: protoFlags,
	}

	return resp, nil
}

func toProtoFlag(f domain.FeatureFlag) zpotify_api.FeatureFlag {
	protoID, ok := featureFlagIDToProto[f.ID]
	if !ok {
		protoID = zpotify_api.FeatureFlagId_FEATURE_FLAG_ID_UNSPECIFIED
	}

	return zpotify_api.FeatureFlag{
		Id:        protoID,
		IsEnabled: f.IsEnabled,
		Value:     string(f.Value),
	}
}
