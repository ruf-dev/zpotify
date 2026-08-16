package v1

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
)

// defaultGlobalSearchLimit caps each result bucket (tracks/artists/
// albums/playlists) when the request omits paging. Mirrors
// AudioService.defaultSearchLimit's role for single-domain search.
const defaultGlobalSearchLimit = 20

// audioSearcher, artistsSearcher and playlistSearcher are the narrow slices
// of AudioService/ArtistsService/PlaylistService that SearchService depends
// on. Declared locally (rather than importing the service package's
// interfaces) to avoid an import cycle: package service already imports
// package v1 to construct its service implementations.
type audioSearcher interface {
	Search(ctx context.Context, req domain.SearchSongsParams) ([]domain.Song, error)
}

type artistsSearcher interface {
	Search(ctx context.Context, query string, limit, offset uint64) ([]domain.ArtistSearchResult, error)
}

type playlistSearcher interface {
	Search(ctx context.Context, query string, limit, offset uint64) (albums, playlists []domain.PlaylistSearchResult, err error)
}

// SearchService composes AudioService, ArtistsService and PlaylistService to
// answer a single free-text query across tracks, artists, albums and
// playlists, without duplicating any of their search SQL.
type SearchService struct {
	audioService    audioSearcher
	artistsService  artistsSearcher
	playlistService playlistSearcher
}

func NewSearchService(audioService audioSearcher, artistsService artistsSearcher, playlistService playlistSearcher) *SearchService {
	return &SearchService{
		audioService:    audioService,
		artistsService:  artistsService,
		playlistService: playlistService,
	}
}

// Search fans req.Query out across tracks, artists, albums and playlists.
// req.Filters.Tags is accepted but intentionally not applied - reserved for
// future genre/mood facet filtering (see domain.SearchFilters).
func (s *SearchService) Search(ctx context.Context, req domain.SearchParams) (domain.SearchResult, error) {
	limit := req.Limit
	if limit == 0 {
		limit = defaultGlobalSearchLimit
	}

	tracks, err := s.audioService.Search(ctx, domain.SearchSongsParams{
		Query:  req.Query,
		Limit:  limit,
		Offset: req.Offset,
		UserId: req.UserId,
	})
	if err != nil {
		return domain.SearchResult{}, rerrors.Wrap(err, "error searching tracks")
	}

	artists, err := s.artistsService.Search(ctx, req.Query, limit, req.Offset)
	if err != nil {
		return domain.SearchResult{}, rerrors.Wrap(err, "error searching artists")
	}

	albums, playlists, err := s.playlistService.Search(ctx, req.Query, limit, req.Offset)
	if err != nil {
		return domain.SearchResult{}, rerrors.Wrap(err, "error searching albums and playlists")
	}

	result := domain.SearchResult{
		Tracks:    tracks,
		Artists:   artists,
		Albums:    albums,
		Playlists: playlists,
	}

	return result, nil
}
