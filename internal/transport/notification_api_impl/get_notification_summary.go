package notification_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) GetNotificationSummary(ctx context.Context, _ *zpotify_api.GetNotificationSummary_Request) (*zpotify_api.GetNotificationSummary_Response, error) {
	unreadCount, err := impl.notificationService.GetSummary(ctx)
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting notification summary")
	}

	resp := &zpotify_api.GetNotificationSummary_Response{
		UnreadCount: uint32(unreadCount),
	}

	return resp, nil
}
