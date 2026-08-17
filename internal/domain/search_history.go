package domain

import "time"

// SearchHistoryEntry is one past search query for a user, optionally
// carrying the "finding" - the item the user clicked after searching.
// FindingType/FindingID/FindingName/FindingCoverUrl are empty strings when
// no finding has been attached yet.
type SearchHistoryEntry struct {
	Query string

	FindingType     string
	FindingID       string
	FindingName     string
	FindingCoverUrl string

	CreatedAt time.Time
}
