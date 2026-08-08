package domain

// Artist is the rich, single-artist representation used by the artist page.
// ArtistBase (embedded via ArtistsBase) stays the minimal reference used
// everywhere else (songs, playlists).
type Artist struct {
	ArtistsBase

	AvatarFileId   *int64
	AvatarFilePath string

	BackgroundCoverFileId   *int64
	BackgroundCoverFilePath string

	CanEdit bool
}

// ArtistPage bundles an artist's header plus its three catalog rows for the
// "one screen, one call" artist page, following HomeService.GetFeed's
// precedent. Rows are capped, no pagination.
type ArtistPage struct {
	Artist Artist

	Albums   []Playlist
	Singles  []Song
	Features []Song
}

type UpdateArtistParams struct {
	Uuid string
	Name string

	AvatarFileId          *int64
	BackgroundCoverFileId *int64
}

type UpdateArtistResult struct {
	AvatarFilePath          *string
	BackgroundCoverFilePath *string
}

// ArtistSongRole distinguishes whether an artist is the primary artist on a
// song (order_id = 0) or a featured artist (order_id != 0).
type ArtistSongRole int

const (
	ArtistSongRolePrimary ArtistSongRole = iota
	ArtistSongRoleFeatured
)

// ListSongsByArtist selects songs where the given artist appears in the
// given role. StandaloneOnly further restricts primary-artist results to
// tracks not attached to any album playlist (i.e. singles).
type ListSongsByArtist struct {
	ArtistUuid     string
	Role           ArtistSongRole
	StandaloneOnly bool
	Limit          uint64
}

// ArtistSearchResult pairs an artist with its full-text search relevance
// rank. Score is only meaningful for results coming out of
// ArtistStorage.Search / ArtistsService.Search.
type ArtistSearchResult struct {
	ArtistsBase
	Score float64
}
