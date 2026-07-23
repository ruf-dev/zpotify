package notification_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) ConsentNotification(ctx context.Context, req *zpotify_api.ConsentNotification_Request) (*zpotify_api.ConsentNotification_Response, error) {
	err := impl.notificationService.Consent(ctx, req.GetId())
	if err != nil {
		return nil, rerrors.Wrap(err, "error consenting to notification")
	}

	return &zpotify_api.ConsentNotification_Response{}, nil
}
