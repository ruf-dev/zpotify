package notification_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"
	"google.golang.org/protobuf/types/known/timestamppb"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) ListNotifications(ctx context.Context, req *zpotify_api.ListNotifications_Request) (*zpotify_api.ListNotifications_Response, error) {
	limit := req.GetPaging().GetLimit()
	offset := req.GetPaging().GetOffset()

	notifications, total, err := impl.notificationService.List(ctx, limit, offset)
	if err != nil {
		return nil, rerrors.Wrap(err, "error listing notifications")
	}

	protoNotifications := make([]*zpotify_api.Notification, 0, len(notifications))
	for _, n := range notifications {
		protoNotification := toPbNotification(n)
		protoNotifications = append(protoNotifications, protoNotification)
	}

	resp := &zpotify_api.ListNotifications_Response{
		Notifications: protoNotifications,
		Total:         uint32(total),
	}

	return resp, nil
}

func toPbNotification(n domain.Notification) *zpotify_api.Notification {
	return &zpotify_api.Notification{
		Id:              n.Id,
		Title:           n.Title,
		BodyMarkdown:    n.BodyMarkdown,
		RequiresConsent: n.RequiresConsent,
		CreatedAt:       timestamppb.New(n.CreatedAt),
		IsRead:          n.IsRead,
		Consented:       n.Consented,
	}
}
