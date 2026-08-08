package v1

import (
	"context"

	"go.zpotify.ru/zpotify/internal/domain"
)

// fakeAudioSearcher is an in-memory test double for the audioSearcher slice
// SearchService depends on (AudioService.Search).
type fakeAudioSearcher struct {
	searchFn func(ctx context.Context, req domain.SearchSongsParams) ([]domain.Song, error)
}

func (f *fakeAudioSearcher) Search(ctx context.Context, req domain.SearchSongsParams) ([]domain.Song, error) {
	if f.searchFn == nil {
		return nil, nil
	}
	return f.searchFn(ctx, req)
}

// fakeArtistsSearcher is an in-memory test double for the artistsSearcher
// slice SearchService depends on (ArtistsService.Search).
type fakeArtistsSearcher struct {
	searchFn func(ctx context.Context, query string, limit, offset uint64) ([]domain.ArtistSearchResult, error)
}

func (f *fakeArtistsSearcher) Search(ctx context.Context, query string, limit, offset uint64) ([]domain.ArtistSearchResult, error) {
	if f.searchFn == nil {
		return nil, nil
	}
	return f.searchFn(ctx, query, limit, offset)
}

// fakePlaylistSearcher is an in-memory test double for the playlistSearcher
// slice SearchService depends on (PlaylistService.Search).
type fakePlaylistSearcher struct {
	searchFn func(ctx context.Context, query string, limit, offset uint64) (albums, playlists []domain.PlaylistSearchResult, err error)
}

func (f *fakePlaylistSearcher) Search(ctx context.Context, query string, limit, offset uint64) (albums, playlists []domain.PlaylistSearchResult, err error) {
	if f.searchFn == nil {
		return nil, nil, nil
	}
	return f.searchFn(ctx, query, limit, offset)
}
