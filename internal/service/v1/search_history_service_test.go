package v1

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
)

func TestSearchHistoryService_RecordQuery_RequiresUser(t *testing.T) {
	svc := &SearchHistoryService{searchHistoryStorage: &fakeSearchHistoryStorage{}}

	err := svc.RecordQuery(context.Background(), "beatles")
	require.Error(t, err)
}

func TestSearchHistoryService_RecordQuery_RejectsEmptyQuery(t *testing.T) {
	svc := &SearchHistoryService{searchHistoryStorage: &fakeSearchHistoryStorage{}}

	err := svc.RecordQuery(contextWithUser(1), "   ")
	require.Error(t, err)
}

func TestSearchHistoryService_RecordQueryTx_InsertsAndTrims(t *testing.T) {
	var insertedUserId int64
	var insertedQuery string
	var trimmed bool
	var trimmedUserId int64

	fake := &fakeSearchHistoryStorage{
		insertQueryFn: func(_ context.Context, userId int64, query string) (domain.SearchHistoryEntry, error) {
			insertedUserId = userId
			insertedQuery = query
			return domain.SearchHistoryEntry{Query: query}, nil
		},
		trimFn: func(_ context.Context, userId int64) error {
			trimmed = true
			trimmedUserId = userId
			return nil
		},
	}

	svc := &SearchHistoryService{searchHistoryStorage: fake}

	err := svc.recordQueryTx(context.Background(), fake, 7, "beatles")
	require.NoError(t, err)

	assert.Equal(t, int64(7), insertedUserId)
	assert.Equal(t, "beatles", insertedQuery)
	assert.True(t, trimmed, "expected Trim to be called")
	assert.Equal(t, int64(7), trimmedUserId)
}

func TestSearchHistoryService_RecordQueryTx_InsertErrorSkipsTrim(t *testing.T) {
	trimmed := false

	fake := &fakeSearchHistoryStorage{
		insertQueryFn: func(_ context.Context, _ int64, _ string) (domain.SearchHistoryEntry, error) {
			return domain.SearchHistoryEntry{}, errors.New("boom")
		},
		trimFn: func(_ context.Context, _ int64) error {
			trimmed = true
			return nil
		},
	}

	svc := &SearchHistoryService{searchHistoryStorage: fake}

	err := svc.recordQueryTx(context.Background(), fake, 7, "beatles")
	require.Error(t, err)
	assert.False(t, trimmed, "trim must not run when insert fails")
}

func TestSearchHistoryService_RecordFinding_RequiresUser(t *testing.T) {
	svc := &SearchHistoryService{searchHistoryStorage: &fakeSearchHistoryStorage{}}

	err := svc.RecordFinding(context.Background(), "beatles", domain.SearchHistoryEntry{})
	require.Error(t, err)
}

func TestSearchHistoryService_RecordFindingTx_AttachesWhenMatched(t *testing.T) {
	var insertCalled bool
	var trimmed bool

	fake := &fakeSearchHistoryStorage{
		attachFindingFn: func(_ context.Context, userId int64, query string, finding domain.SearchHistoryEntry) (bool, error) {
			assert.Equal(t, int64(7), userId)
			assert.Equal(t, "beatles", query)
			assert.Equal(t, "track", finding.FindingType)
			return true, nil
		},
		insertQueryFn: func(_ context.Context, _ int64, _ string) (domain.SearchHistoryEntry, error) {
			insertCalled = true
			return domain.SearchHistoryEntry{}, nil
		},
		trimFn: func(_ context.Context, _ int64) error {
			trimmed = true
			return nil
		},
	}

	svc := &SearchHistoryService{searchHistoryStorage: fake}
	finding := domain.SearchHistoryEntry{FindingType: "track"}

	err := svc.recordFindingTx(context.Background(), fake, 7, "beatles", finding)
	require.NoError(t, err)

	assert.False(t, insertCalled, "must not fall back to insert when a row matched")
	assert.True(t, trimmed)
}

func TestSearchHistoryService_RecordFindingTx_FallsBackToInsertWhenUnmatched(t *testing.T) {
	var insertedQuery string
	attachCalls := 0
	var trimmed bool

	fake := &fakeSearchHistoryStorage{
		attachFindingFn: func(_ context.Context, _ int64, _ string, _ domain.SearchHistoryEntry) (bool, error) {
			attachCalls++
			return false, nil
		},
		insertQueryFn: func(_ context.Context, userId int64, query string) (domain.SearchHistoryEntry, error) {
			assert.Equal(t, int64(7), userId)
			insertedQuery = query
			return domain.SearchHistoryEntry{Query: query}, nil
		},
		trimFn: func(_ context.Context, _ int64) error {
			trimmed = true
			return nil
		},
	}

	svc := &SearchHistoryService{searchHistoryStorage: fake}
	finding := domain.SearchHistoryEntry{FindingType: "track", FindingID: "1"}

	err := svc.recordFindingTx(context.Background(), fake, 7, "beatles", finding)
	require.NoError(t, err)

	assert.Equal(t, "beatles", insertedQuery)
	assert.Equal(t, 2, attachCalls, "expected attach to be retried after the fallback insert")
	assert.True(t, trimmed)
}

func TestSearchHistoryService_List_RequiresUser(t *testing.T) {
	svc := &SearchHistoryService{searchHistoryStorage: &fakeSearchHistoryStorage{}}

	_, err := svc.List(context.Background())
	require.Error(t, err)
}

func TestSearchHistoryService_List_ReturnsEntries(t *testing.T) {
	expected := []domain.SearchHistoryEntry{
		{Query: "beatles"},
		{Query: "queen"},
	}

	fake := &fakeSearchHistoryStorage{
		listFn: func(_ context.Context, userId int64) ([]domain.SearchHistoryEntry, error) {
			assert.Equal(t, int64(9), userId)
			return expected, nil
		},
	}

	svc := &SearchHistoryService{searchHistoryStorage: fake}

	entries, err := svc.List(contextWithUser(9))
	require.NoError(t, err)
	assert.Equal(t, expected, entries)
}
