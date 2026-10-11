package domain

import "time"

type TorrentSearchResult struct {
	Id                string
	Title             string
	SizeBytes         int64
	Indexer           string
	PublishedAt       time.Time
	IsAlreadyImported bool
}
