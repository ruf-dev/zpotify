package search_api_impl

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
)

func TestToPbSearchHistoryEntry_MapsAllFields(t *testing.T) {
	createdAt := time.Date(2026, 8, 16, 12, 0, 0, 0, time.UTC)
	entry := domain.SearchHistoryEntry{
		Query:           "beatles",
		FindingType:     "track",
		FindingID:       "42",
		FindingName:     "Let It Be",
		FindingCoverUrl: "covers/let-it-be.png",
		CreatedAt:       createdAt,
	}

	pbEntry := toPbSearchHistoryEntry(entry)

	require.NotNil(t, pbEntry)
	assert.Equal(t, "beatles", pbEntry.Query)
	assert.Equal(t, "track", pbEntry.FindingType)
	assert.Equal(t, "42", pbEntry.FindingId)
	assert.Equal(t, "Let It Be", pbEntry.FindingName)
	assert.Equal(t, "covers/let-it-be.png", pbEntry.FindingCoverUrl)
	require.NotNil(t, pbEntry.CreatedAt)
	assert.True(t, createdAt.Equal(pbEntry.CreatedAt.AsTime()))
}

func TestToPbSearchHistoryEntry_LeavesFindingFieldsEmptyWhenAbsent(t *testing.T) {
	entry := domain.SearchHistoryEntry{Query: "beatles"}

	pbEntry := toPbSearchHistoryEntry(entry)

	assert.Empty(t, pbEntry.FindingType)
	assert.Empty(t, pbEntry.FindingId)
	assert.Empty(t, pbEntry.FindingName)
	assert.Empty(t, pbEntry.FindingCoverUrl)
}
