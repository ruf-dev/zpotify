package domain

// SearchFilters carries facet filters accepted alongside a search query.
//
// Tags is reserved for future genre/mood facet filtering (mirrors AlbumTag
// kinds) - it must be accepted end-to-end but is intentionally NOT applied
// as a filter anywhere in this pass.
type SearchFilters struct {
	Tags []string
}

// SearchParams is the input to SearchService.Search - a single free-text
// query fanned out across tracks, artists, albums and playlists.
type SearchParams struct {
	Query  string
	Limit  uint64
	Offset uint64
	// UserId scopes track container-playlist resolution to playlists that
	// are public or that this user has access to. Zero value (unauthenticated)
	// resolves only public playlists.
	UserId  int64
	Filters SearchFilters
}

// SearchResult bundles the per-type results of a global search. Albums and
// Playlists are both drawn from playlists_search_view_v1, split by whether
// each result has artists attached (see PlaylistSearchResult).
type SearchResult struct {
	Tracks    []Song
	Artists   []ArtistSearchResult
	Albums    []PlaylistSearchResult
	Playlists []PlaylistSearchResult
}
