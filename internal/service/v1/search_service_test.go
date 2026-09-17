package v1

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
)

func TestSearchService_Search_ReturnsResultsAcrossAllTypes(t *testing.T) {
	song := domain.Song{SongBase: domain.SongBase{Id: 1, Title: "Some Song"}, Score: 0.8}
	artist := domain.ArtistSearchResult{ArtistsBase: domain.ArtistsBase{Uuid: testArtistUuid, Name: testArtistName}, AvatarFilePath: "artists/artist-uuid/avatar.png", Score: 0.7}
	album := domain.PlaylistSearchResult{Playlist: domain.Playlist{Uuid: testAlbumUuid, Name: testAlbumName}, Score: 0.6}
	playlist := domain.PlaylistSearchResult{Playlist: domain.Playlist{Uuid: testPlaylistUuid, Name: "Some Playlist"}, Score: 0.5}

	audio := &fakeAudioSearcher{
		searchFn: func(_ context.Context, req domain.SearchSongsParams) ([]domain.Song, error) {
			assert.Equal(t, testSearchQuery, req.Query)
			return []domain.Song{song}, nil
		},
	}
	artists := &fakeArtistsSearcher{
		searchFn: func(_ context.Context, query string, _, _ uint64) ([]domain.ArtistSearchResult, error) {
			assert.Equal(t, testSearchQuery, query)
			return []domain.ArtistSearchResult{artist}, nil
		},
	}
	playlists := &fakePlaylistSearcher{
		searchFn: func(_ context.Context, query string, _, _ uint64) ([]domain.PlaylistSearchResult, []domain.PlaylistSearchResult, error) {
			assert.Equal(t, testSearchQuery, query)
			return []domain.PlaylistSearchResult{album}, []domain.PlaylistSearchResult{playlist}, nil
		},
	}

	svc := NewSearchService(audio, artists, playlists)

	result, err := svc.Search(context.Background(), domain.SearchParams{Query: testSearchQuery, Limit: 10})
	require.NoError(t, err)

	require.Len(t, result.Tracks, 1)
	assert.Equal(t, int64(1), result.Tracks[0].SongBase.Id)

	require.Len(t, result.Artists, 1)
	assert.Equal(t, testArtistUuid, result.Artists[0].Uuid)
	assert.Equal(t, "artists/artist-uuid/avatar.png", result.Artists[0].AvatarFilePath)

	require.Len(t, result.Albums, 1)
	assert.Equal(t, testAlbumUuid, result.Albums[0].Uuid)

	require.Len(t, result.Playlists, 1)
	assert.Equal(t, testPlaylistUuid, result.Playlists[0].Uuid)
}

func TestSearchService_Search_EmptyQueryReturnsEmptyResult(t *testing.T) {
	audio := &fakeAudioSearcher{
		searchFn: func(_ context.Context, req domain.SearchSongsParams) ([]domain.Song, error) {
			assert.Equal(t, "", req.Query)
			return nil, nil
		},
	}
	artists := &fakeArtistsSearcher{
		searchFn: func(_ context.Context, _ string, _, _ uint64) ([]domain.ArtistSearchResult, error) {
			return nil, nil
		},
	}
	playlists := &fakePlaylistSearcher{
		searchFn: func(_ context.Context, _ string, _, _ uint64) ([]domain.PlaylistSearchResult, []domain.PlaylistSearchResult, error) {
			return nil, nil, nil
		},
	}

	svc := NewSearchService(audio, artists, playlists)

	result, err := svc.Search(context.Background(), domain.SearchParams{Query: ""})
	require.NoError(t, err)

	assert.Empty(t, result.Tracks)
	assert.Empty(t, result.Artists)
	assert.Empty(t, result.Albums)
	assert.Empty(t, result.Playlists)
}

func TestSearchService_Search_MatchesOnlyOneType(t *testing.T) {
	artist := domain.ArtistSearchResult{ArtistsBase: domain.ArtistsBase{Uuid: testArtistUuid, Name: "Only Match"}, Score: 0.9}

	audio := &fakeAudioSearcher{
		searchFn: func(_ context.Context, _ domain.SearchSongsParams) ([]domain.Song, error) {
			return nil, nil
		},
	}
	artists := &fakeArtistsSearcher{
		searchFn: func(_ context.Context, _ string, _, _ uint64) ([]domain.ArtistSearchResult, error) {
			return []domain.ArtistSearchResult{artist}, nil
		},
	}
	playlists := &fakePlaylistSearcher{
		searchFn: func(_ context.Context, _ string, _, _ uint64) ([]domain.PlaylistSearchResult, []domain.PlaylistSearchResult, error) {
			return nil, nil, nil
		},
	}

	svc := NewSearchService(audio, artists, playlists)

	result, err := svc.Search(context.Background(), domain.SearchParams{Query: "only match"})
	require.NoError(t, err)

	assert.Empty(t, result.Tracks)
	assert.Empty(t, result.Albums)
	assert.Empty(t, result.Playlists)
	require.Len(t, result.Artists, 1)
	assert.Equal(t, testArtistUuid, result.Artists[0].Uuid)
}

func TestSearchService_Search_AlbumPlaylistSplitIsPreserved(t *testing.T) {
	album := domain.PlaylistSearchResult{Playlist: domain.Playlist{Uuid: testAlbumUuid, Artists: []domain.ArtistsBase{{Uuid: "a"}}}}
	playlist := domain.PlaylistSearchResult{Playlist: domain.Playlist{Uuid: testPlaylistUuid}}

	audio := &fakeAudioSearcher{}
	artists := &fakeArtistsSearcher{}
	playlists := &fakePlaylistSearcher{
		searchFn: func(_ context.Context, _ string, _, _ uint64) ([]domain.PlaylistSearchResult, []domain.PlaylistSearchResult, error) {
			return []domain.PlaylistSearchResult{album}, []domain.PlaylistSearchResult{playlist}, nil
		},
	}

	svc := NewSearchService(audio, artists, playlists)

	result, err := svc.Search(context.Background(), domain.SearchParams{Query: testSearchQuery})
	require.NoError(t, err)

	require.Len(t, result.Albums, 1)
	assert.Equal(t, testAlbumUuid, result.Albums[0].Uuid)

	require.Len(t, result.Playlists, 1)
	assert.Equal(t, testPlaylistUuid, result.Playlists[0].Uuid)
}

func TestSearchService_Search_UsesDefaultLimitWhenZero(t *testing.T) {
	var gotAudioLimit, gotArtistLimit, gotPlaylistLimit uint64

	audio := &fakeAudioSearcher{
		searchFn: func(_ context.Context, req domain.SearchSongsParams) ([]domain.Song, error) {
			gotAudioLimit = req.Limit
			return nil, nil
		},
	}
	artists := &fakeArtistsSearcher{
		searchFn: func(_ context.Context, _ string, limit, _ uint64) ([]domain.ArtistSearchResult, error) {
			gotArtistLimit = limit
			return nil, nil
		},
	}
	playlists := &fakePlaylistSearcher{
		searchFn: func(_ context.Context, _ string, limit, _ uint64) ([]domain.PlaylistSearchResult, []domain.PlaylistSearchResult, error) {
			gotPlaylistLimit = limit
			return nil, nil, nil
		},
	}

	svc := NewSearchService(audio, artists, playlists)

	_, err := svc.Search(context.Background(), domain.SearchParams{Query: testSearchQuery})
	require.NoError(t, err)

	assert.Equal(t, uint64(defaultGlobalSearchLimit), gotAudioLimit)
	assert.Equal(t, uint64(defaultGlobalSearchLimit), gotArtistLimit)
	assert.Equal(t, uint64(defaultGlobalSearchLimit), gotPlaylistLimit)
}

func TestSearchService_Search_PropagatesSubServiceErrors(t *testing.T) {
	tests := []struct {
		name      string
		audio     *fakeAudioSearcher
		artists   *fakeArtistsSearcher
		playlists *fakePlaylistSearcher
	}{
		{
			name: "audio error",
			audio: &fakeAudioSearcher{searchFn: func(_ context.Context, _ domain.SearchSongsParams) ([]domain.Song, error) {
				return nil, assert.AnError
			}},
			artists:   &fakeArtistsSearcher{},
			playlists: &fakePlaylistSearcher{},
		},
		{
			name:  "artists error",
			audio: &fakeAudioSearcher{},
			artists: &fakeArtistsSearcher{searchFn: func(_ context.Context, _ string, _, _ uint64) ([]domain.ArtistSearchResult, error) {
				return nil, assert.AnError
			}},
			playlists: &fakePlaylistSearcher{},
		},
		{
			name:    "playlists error",
			audio:   &fakeAudioSearcher{},
			artists: &fakeArtistsSearcher{},
			playlists: &fakePlaylistSearcher{searchFn: func(_ context.Context, _ string, _, _ uint64) ([]domain.PlaylistSearchResult, []domain.PlaylistSearchResult, error) {
				return nil, nil, assert.AnError
			}},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc := NewSearchService(tt.audio, tt.artists, tt.playlists)

			_, err := svc.Search(context.Background(), domain.SearchParams{Query: testSearchQuery})
			require.Error(t, err)
		})
	}
}
