package v1

import (
	"context"
	"database/sql"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

// fakeSearchHistoryStorage is an in-memory test double for
// storage.SearchHistoryStorage. Every method delegates to an optional
// function field so each test only wires up the behaviour it cares about;
// unset functions return zero values.
type fakeSearchHistoryStorage struct {
	insertQueryFn   func(ctx context.Context, userId int64, query string) (domain.SearchHistoryEntry, error)
	attachFindingFn func(ctx context.Context, userId int64, query string, finding domain.SearchHistoryEntry) (bool, error)
	listFn          func(ctx context.Context, userId int64) ([]domain.SearchHistoryEntry, error)
	trimFn          func(ctx context.Context, userId int64) error
}

func (f *fakeSearchHistoryStorage) InsertQuery(ctx context.Context, userId int64, query string) (domain.SearchHistoryEntry, error) {
	if f.insertQueryFn == nil {
		return domain.SearchHistoryEntry{}, nil
	}
	return f.insertQueryFn(ctx, userId, query)
}

func (f *fakeSearchHistoryStorage) AttachFinding(ctx context.Context, userId int64, query string, finding domain.SearchHistoryEntry) (bool, error) {
	if f.attachFindingFn == nil {
		return false, nil
	}
	return f.attachFindingFn(ctx, userId, query, finding)
}

func (f *fakeSearchHistoryStorage) List(ctx context.Context, userId int64) ([]domain.SearchHistoryEntry, error) {
	if f.listFn == nil {
		return nil, nil
	}
	return f.listFn(ctx, userId)
}

func (f *fakeSearchHistoryStorage) Trim(ctx context.Context, userId int64) error {
	if f.trimFn == nil {
		return nil
	}
	return f.trimFn(ctx, userId)
}

func (f *fakeSearchHistoryStorage) WithTx(_ *sql.Tx) storage.SearchHistoryStorage {
	return f
}
