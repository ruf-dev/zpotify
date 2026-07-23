package pg

import (
	"context"
	"database/sql"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/notification_q"
)

type NotificationStorage struct {
	db      sqldb.DB
	querier notification_q.Querier
}

func NewNotificationStorage(db sqldb.DB) *NotificationStorage {
	return &NotificationStorage{
		db:      db,
		querier: notification_q.New(db),
	}
}

func (s *NotificationStorage) Create(ctx context.Context, title, bodyMarkdown string, requiresConsent bool) (domain.Notification, error) {
	params := notification_q.CreateNotificationParams{
		Title:           title,
		BodyMarkdown:    bodyMarkdown,
		RequiresConsent: requiresConsent,
	}

	row, err := s.querier.CreateNotification(ctx, params)
	if err != nil {
		return domain.Notification{}, rerrors.Wrap(wrapPgErr(err), "create notification")
	}

	notification := domain.Notification{
		Id:              row.ID,
		Title:           row.Title,
		BodyMarkdown:    row.BodyMarkdown,
		RequiresConsent: row.RequiresConsent,
		CreatedAt:       row.CreatedAt,
	}

	return notification, nil
}

func (s *NotificationStorage) SnapshotRecipients(ctx context.Context, notificationID int64) error {
	err := s.querier.SnapshotNotificationRecipients(ctx, notificationID)
	if err != nil {
		return rerrors.Wrap(wrapPgErr(err), "snapshot notification recipients")
	}

	return nil
}

func (s *NotificationStorage) List(ctx context.Context, userId int64, limit, offset uint64) ([]domain.Notification, error) {
	params := notification_q.ListNotificationsForUserParams{
		UserID: userId,
		Limit:  int32(limit),
		Offset: int32(offset),
	}

	rows, err := s.querier.ListNotificationsForUser(ctx, params)
	if err != nil {
		return nil, rerrors.Wrap(wrapPgErr(err), "list notifications for user")
	}

	notifications := make([]domain.Notification, 0, len(rows))
	for _, row := range rows {
		notification := domain.Notification{
			Id:              row.ID,
			Title:           row.Title,
			BodyMarkdown:    row.BodyMarkdown,
			RequiresConsent: row.RequiresConsent,
			CreatedAt:       row.CreatedAt,
			IsRead:          row.ReadAt.Valid,
			Consented:       row.ConsentedAt.Valid,
		}

		notifications = append(notifications, notification)
	}

	return notifications, nil
}

func (s *NotificationStorage) Count(ctx context.Context, userId int64) (int64, error) {
	total, err := s.querier.CountNotificationsForUser(ctx, userId)
	if err != nil {
		return 0, rerrors.Wrap(wrapPgErr(err), "count notifications for user")
	}

	return total, nil
}

func (s *NotificationStorage) GetUnreadCount(ctx context.Context, userId int64) (int64, error) {
	total, err := s.querier.GetUnreadNotificationCount(ctx, userId)
	if err != nil {
		return 0, rerrors.Wrap(wrapPgErr(err), "get unread notification count")
	}

	return total, nil
}

func (s *NotificationStorage) MarkRead(ctx context.Context, userId, notificationID int64) error {
	params := notification_q.MarkNotificationReadParams{
		NotificationID: notificationID,
		UserID:         userId,
	}

	err := s.querier.MarkNotificationRead(ctx, params)
	if err != nil {
		return rerrors.Wrap(wrapPgErr(err), "mark notification read")
	}

	return nil
}

func (s *NotificationStorage) Consent(ctx context.Context, userId, notificationID int64) error {
	params := notification_q.ConsentNotificationParams{
		NotificationID: notificationID,
		UserID:         userId,
	}

	err := s.querier.ConsentNotification(ctx, params)
	if err != nil {
		return rerrors.Wrap(wrapPgErr(err), "consent notification")
	}

	return nil
}

func (s *NotificationStorage) WithTx(tx *sql.Tx) storage.NotificationStorage {
	return NewNotificationStorage(tx)
}
