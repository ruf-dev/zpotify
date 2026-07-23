package v1

import (
	"context"
	"database/sql"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
	"go.zpotify.ru/zpotify/internal/user_errors"
)

type NotificationService struct {
	notificationStorage storage.NotificationStorage

	txManager *tx_manager.TxManager
}

func NewNotificationService(dataStorage storage.Storage) *NotificationService {
	return &NotificationService{
		notificationStorage: dataStorage.Notification(),
		txManager:           dataStorage.TxManager(),
	}
}

// GetSummary returns the number of unread notifications for the caller.
func (s *NotificationService) GetSummary(ctx context.Context) (int64, error) {
	userId, err := s.currentUserId(ctx)
	if err != nil {
		return 0, rerrors.Wrap(err)
	}

	unreadCount, err := s.notificationStorage.GetUnreadCount(ctx, userId)
	if err != nil {
		return 0, rerrors.Wrap(err, "error getting unread notification count from storage")
	}

	return unreadCount, nil
}

// List returns a page of notifications for the caller along with the total count.
func (s *NotificationService) List(ctx context.Context, limit, offset uint64) ([]domain.Notification, int64, error) {
	userId, err := s.currentUserId(ctx)
	if err != nil {
		return nil, 0, rerrors.Wrap(err)
	}

	notifications, err := s.notificationStorage.List(ctx, userId, limit, offset)
	if err != nil {
		return nil, 0, rerrors.Wrap(err, "error listing notifications from storage")
	}

	total, err := s.notificationStorage.Count(ctx, userId)
	if err != nil {
		return nil, 0, rerrors.Wrap(err, "error counting notifications from storage")
	}

	return notifications, total, nil
}

// MarkRead marks a notification as read for the caller. Idempotent.
func (s *NotificationService) MarkRead(ctx context.Context, notificationID int64) error {
	userId, err := s.currentUserId(ctx)
	if err != nil {
		return rerrors.Wrap(err)
	}

	err = s.notificationStorage.MarkRead(ctx, userId, notificationID)
	if err != nil {
		return rerrors.Wrap(err, "error marking notification as read in storage")
	}

	return nil
}

// Consent records the caller's consent to a notification, also marking it read.
func (s *NotificationService) Consent(ctx context.Context, notificationID int64) error {
	userId, err := s.currentUserId(ctx)
	if err != nil {
		return rerrors.Wrap(err)
	}

	err = s.notificationStorage.Consent(ctx, userId, notificationID)
	if err != nil {
		return rerrors.Wrap(err, "error consenting to notification in storage")
	}

	return nil
}

// CreateAndBroadcast creates a new notification and atomically snapshots the
// current set of users as its recipients. Called by the Telegram bot's admin
// notify commands - not exposed over gRPC.
func (s *NotificationService) CreateAndBroadcast(ctx context.Context, title, body string, requiresConsent bool) error {
	err := s.txManager.Execute(
		func(tx *sql.Tx) error {
			return s.createAndBroadcastTx(ctx, s.notificationStorage.WithTx(tx), title, body, requiresConsent)
		})
	if err != nil {
		return rerrors.Wrap(err, "error creating and broadcasting notification")
	}

	return nil
}

// createAndBroadcastTx creates a notification and snapshots its recipients
// through the given (already tx-scoped) storage. Split out of
// CreateAndBroadcast so the create+snapshot orchestration can be unit tested
// without a real transaction/DB.
func (s *NotificationService) createAndBroadcastTx(
	ctx context.Context,
	notificationStorage storage.NotificationStorage,
	title, body string,
	requiresConsent bool,
) error {
	notification, err := notificationStorage.Create(ctx, title, body, requiresConsent)
	if err != nil {
		return rerrors.Wrap(err, "error creating notification")
	}

	err = notificationStorage.SnapshotRecipients(ctx, notification.Id)
	if err != nil {
		return rerrors.Wrap(err, "error snapshotting notification recipients")
	}

	return nil
}

// currentUserId reads the caller's user id from context. Shared by every
// caller-scoped method above.
func (s *NotificationService) currentUserId(ctx context.Context) (int64, error) {
	uc, ok := user_context.GetUserContext(ctx)
	if !ok {
		return 0, rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	return uc.UserId, nil
}
