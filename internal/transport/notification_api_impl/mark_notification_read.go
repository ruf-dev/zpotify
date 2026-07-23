package notification_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) MarkNotificationRead(ctx context.Context, req *zpotify_api.MarkNotificationRead_Request) (*zpotify_api.MarkNotificationRead_Response, error) {
	err := impl.notificationService.MarkRead(ctx, req.GetId())
	if err != nil {
		return nil, rerrors.Wrap(err, "error marking notification as read")
	}

	return &zpotify_api.MarkNotificationRead_Response{}, nil
}
