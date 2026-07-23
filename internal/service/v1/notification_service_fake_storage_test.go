package v1

import (
	"context"
	"database/sql"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

// fakeNotificationStorage is an in-memory test double for storage.NotificationStorage.
// Every method delegates to an optional function field so each test only wires
// up the behaviour it cares about; unset functions return zero values.
type fakeNotificationStorage struct {
	createFn    func(ctx context.Context, title, bodyMarkdown string, requiresConsent bool) (domain.Notification, error)
	snapshotFn  func(ctx context.Context, notificationID int64) error
	listFn      func(ctx context.Context, userId int64, limit, offset uint64) ([]domain.Notification, error)
	countFn     func(ctx context.Context, userId int64) (int64, error)
	getUnreadFn func(ctx context.Context, userId int64) (int64, error)
	markReadFn  func(ctx context.Context, userId, notificationID int64) error
	consentFn   func(ctx context.Context, userId, notificationID int64) error
}

func (f *fakeNotificationStorage) Create(ctx context.Context, title, bodyMarkdown string, requiresConsent bool) (domain.Notification, error) {
	if f.createFn == nil {
		return domain.Notification{}, nil
	}
	return f.createFn(ctx, title, bodyMarkdown, requiresConsent)
}

func (f *fakeNotificationStorage) SnapshotRecipients(ctx context.Context, notificationID int64) error {
	if f.snapshotFn == nil {
		return nil
	}
	return f.snapshotFn(ctx, notificationID)
}

func (f *fakeNotificationStorage) List(ctx context.Context, userId int64, limit, offset uint64) ([]domain.Notification, error) {
	if f.listFn == nil {
		return nil, nil
	}
	return f.listFn(ctx, userId, limit, offset)
}

func (f *fakeNotificationStorage) Count(ctx context.Context, userId int64) (int64, error) {
	if f.countFn == nil {
		return 0, nil
	}
	return f.countFn(ctx, userId)
}

func (f *fakeNotificationStorage) GetUnreadCount(ctx context.Context, userId int64) (int64, error) {
	if f.getUnreadFn == nil {
		return 0, nil
	}
	return f.getUnreadFn(ctx, userId)
}

func (f *fakeNotificationStorage) MarkRead(ctx context.Context, userId, notificationID int64) error {
	if f.markReadFn == nil {
		return nil
	}
	return f.markReadFn(ctx, userId, notificationID)
}

func (f *fakeNotificationStorage) Consent(ctx context.Context, userId, notificationID int64) error {
	if f.consentFn == nil {
		return nil
	}
	return f.consentFn(ctx, userId, notificationID)
}

func (f *fakeNotificationStorage) WithTx(_ *sql.Tx) storage.NotificationStorage {
	return f
}
