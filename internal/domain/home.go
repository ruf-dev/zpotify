package domain

import "time"

// FeedSong mirrors PlaylistSong's shape (SongBase + Artists) rather than adding
// CreatedAt onto the widely-shared SongBase struct - keeps the blast radius small.
type FeedSong struct {
	SongBase
	Artists   []ArtistsBase
	CreatedAt time.Time
}

type FeedDay struct {
	Date           time.Time
	PlaylistsAdded []Playlist
	SongsAdded     []FeedSong
	ArtistsAdded   []ArtistsBase
}

type GetFeedRequest struct {
	Limit  uint64
	Offset uint64
}

type GetFeedResult struct {
	Days      []FeedDay
	TotalDays uint32
}
