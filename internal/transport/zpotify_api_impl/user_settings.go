package zpotify_api_impl

import (
	"context"
	"encoding/json"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	querier "go.zpotify.ru/zpotify/internal/storage/pg/generated"
	"go.zpotify.ru/zpotify/pkg/zpotify_api"
)

func (impl *Impl) GetUserSettings(ctx context.Context, _ *zpotify_api.GetUserSettings_Request) (*zpotify_api.GetUserSettings_Response, error) {
	settings, err := impl.userService.GetSettings(ctx)
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting settings")
	}

	pbSettings, err := toPbUserSettings(settings)
	if err != nil {
		return nil, rerrors.Wrap(err, "error parsing user settings to pb response")
	}

	return &zpotify_api.GetUserSettings_Response{
		Settings: pbSettings,
	}, nil
}

func toPbUserSettings(settings domain.UserSettings) (*zpotify_api.UserSettings, error) {
	pbSettings := &zpotify_api.UserSettings{
		HomeSegments: nil,
		Ui: &zpotify_api.UiSettings{
			Locale: settings.Ui.Locale,
		},
	}

	var err error
	pbSettings.HomeSegments, err = toPbHomeSegments(settings.HomeSegments)
	if err != nil {
		return nil, rerrors.Wrap(err, "error marshalling to pb home segments")
	}

	return pbSettings, nil
}

func toPbHomeSegments(segment []domain.UserHomeSegment) ([]*zpotify_api.HomePageSegment, error) {
	out := make([]*zpotify_api.HomePageSegment, 0, len(segment))

	for _, s := range segment {
		pbSeg, err := toPbHomeSegment(s)
		if err != nil {
			return nil, rerrors.Wrap(err, "")
		}

		if pbSeg != nil {
			out = append(out, pbSeg)
		}
	}

	return out, nil
}

func toPbHomeSegment(s domain.UserHomeSegment) (*zpotify_api.HomePageSegment, error) {

	switch s.Type {
	case querier.UserHomeSegmentTypePlaylist:
		return toPlaylistSegment(s)
	default:
		// TODO alert?
		return nil, nil
	}
}

func toPlaylistSegment(s domain.UserHomeSegment) (*zpotify_api.HomePageSegment, error) {
	seg := &zpotify_api.HomePageSegment_PlaylistSegment{}

	err := json.Unmarshal(s.Segment, seg)
	if err != nil {
		//TODO make more tolerant to errors
		return nil, rerrors.Wrap(err, "error unmarshalling segment data")
	}

	return &zpotify_api.HomePageSegment{
		Segment: &zpotify_api.HomePageSegment_PlaylistSegment_{
			PlaylistSegment: seg,
		},
	}, nil
}
