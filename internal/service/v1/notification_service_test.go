package v1

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
)

func contextWithUser(userId int64) context.Context {
	return user_context.WithUserContext(context.Background(), user_context.UserContext{UserId: userId})
}

func TestNotificationService_CreateAndBroadcastTx_SnapshotsRecipients(t *testing.T) {
	var snapshotCalled bool
	var snapshotNotificationId int64

	fake := &fakeNotificationStorage{
		createFn: func(_ context.Context, title, bodyMarkdown string, requiresConsent bool) (domain.Notification, error) {
			assert.Equal(t, "title", title)
			assert.Equal(t, "body", bodyMarkdown)
			assert.True(t, requiresConsent)

			return domain.Notification{
				Id:              42,
				Title:           title,
				BodyMarkdown:    bodyMarkdown,
				RequiresConsent: requiresConsent,
			}, nil
		},
		snapshotFn: func(_ context.Context, notificationID int64) error {
			snapshotCalled = true
			snapshotNotificationId = notificationID
			return nil
		},
	}

	svc := &NotificationService{notificationStorage: fake}

	err := svc.createAndBroadcastTx(context.Background(), fake, "title", "body", true)
	require.NoError(t, err)

	assert.True(t, snapshotCalled, "expected SnapshotRecipients to be called")
	assert.Equal(t, int64(42), snapshotNotificationId, "expected snapshot to use the id returned by Create")
}

func TestNotificationService_CreateAndBroadcastTx_CreateErrorSkipsSnapshot(t *testing.T) {
	snapshotCalled := false

	fake := &fakeNotificationStorage{
		createFn: func(_ context.Context, _, _ string, _ bool) (domain.Notification, error) {
			return domain.Notification{}, errors.New("boom")
		},
		snapshotFn: func(_ context.Context, _ int64) error {
			snapshotCalled = true
			return nil
		},
	}

	svc := &NotificationService{notificationStorage: fake}

	err := svc.createAndBroadcastTx(context.Background(), fake, "title", "body", false)
	require.Error(t, err)
	assert.False(t, snapshotCalled, "snapshot must not run when create fails")
}

func TestNotificationService_CreateAndBroadcastTx_SnapshotErrorPropagates(t *testing.T) {
	fake := &fakeNotificationStorage{
		createFn: func(_ context.Context, _, _ string, _ bool) (domain.Notification, error) {
			return domain.Notification{Id: 1}, nil
		},
		snapshotFn: func(_ context.Context, _ int64) error {
			return errors.New("snapshot failed")
		},
	}

	svc := &NotificationService{notificationStorage: fake}

	err := svc.createAndBroadcastTx(context.Background(), fake, "title", "body", false)
	require.Error(t, err)
}

func TestNotificationService_MarkRead_IsIdempotent(t *testing.T) {
	// Mirrors the storage's real semantics (UPDATE ... WHERE read_at IS NULL):
	// marking an already-read notification again is a no-op, never an error.
	var read bool
	calls := 0

	fake := &fakeNotificationStorage{
		markReadFn: func(_ context.Context, userId, notificationID int64) error {
			calls++
			assert.Equal(t, int64(7), userId)
			assert.Equal(t, int64(1), notificationID)
			read = true
			return nil
		},
	}

	svc := &NotificationService{notificationStorage: fake}
	ctx := contextWithUser(7)

	require.NoError(t, svc.MarkRead(ctx, 1))
	require.NoError(t, svc.MarkRead(ctx, 1))

	assert.Equal(t, 2, calls, "service should call storage.MarkRead each time, idempotency is storage's job")
	assert.True(t, read)
}

func TestNotificationService_MarkRead_RequiresUser(t *testing.T) {
	svc := &NotificationService{notificationStorage: &fakeNotificationStorage{}}

	err := svc.MarkRead(context.Background(), 1)
	require.Error(t, err)
}

func TestNotificationService_Consent_SetsReadAndConsented(t *testing.T) {
	// Mirrors the real query: consented_at = now(), read_at = coalesce(read_at, now()).
	var isRead, isConsented bool

	fake := &fakeNotificationStorage{
		consentFn: func(_ context.Context, userId, notificationID int64) error {
			assert.Equal(t, int64(3), userId)
			assert.Equal(t, int64(10), notificationID)
			isConsented = true
			isRead = true
			return nil
		},
	}

	svc := &NotificationService{notificationStorage: fake}

	err := svc.Consent(contextWithUser(3), 10)
	require.NoError(t, err)

	assert.True(t, isRead, "consenting must also mark the notification read")
	assert.True(t, isConsented)
}

func TestNotificationService_GetSummary_RequiresUser(t *testing.T) {
	svc := &NotificationService{notificationStorage: &fakeNotificationStorage{}}

	_, err := svc.GetSummary(context.Background())
	require.Error(t, err)
}

func TestNotificationService_GetSummary_ReturnsUnreadCount(t *testing.T) {
	fake := &fakeNotificationStorage{
		getUnreadFn: func(_ context.Context, userId int64) (int64, error) {
			assert.Equal(t, int64(5), userId)
			return 3, nil
		},
	}

	svc := &NotificationService{notificationStorage: fake}

	count, err := svc.GetSummary(contextWithUser(5))
	require.NoError(t, err)
	assert.Equal(t, int64(3), count)
}

func TestNotificationService_List_ReturnsNotificationsAndTotal(t *testing.T) {
	expected := []domain.Notification{
		{Id: 1, Title: "a"},
		{Id: 2, Title: "b"},
	}

	fake := &fakeNotificationStorage{
		listFn: func(_ context.Context, userId int64, limit, offset uint64) ([]domain.Notification, error) {
			assert.Equal(t, int64(9), userId)
			assert.Equal(t, uint64(10), limit)
			assert.Equal(t, uint64(20), offset)
			return expected, nil
		},
		countFn: func(_ context.Context, userId int64) (int64, error) {
			assert.Equal(t, int64(9), userId)
			return 2, nil
		},
	}

	svc := &NotificationService{notificationStorage: fake}

	notifications, total, err := svc.List(contextWithUser(9), 10, 20)
	require.NoError(t, err)
	assert.Equal(t, expected, notifications)
	assert.Equal(t, int64(2), total)
}
