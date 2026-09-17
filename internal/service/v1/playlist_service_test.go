package v1

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
)

func TestPlaylistService_Search_SplitsAlbumsFromPlaylists(t *testing.T) {
	album := domain.PlaylistSearchResult{
		Playlist: domain.Playlist{
			Uuid:    testAlbumUuid,
			Name:    testAlbumName,
			Artists: []domain.ArtistsBase{{Uuid: testArtistUuid, Name: testArtistName}},
		},
		Score: 0.9,
	}
	plainPlaylist := domain.PlaylistSearchResult{
		Playlist: domain.Playlist{
			Uuid: testPlaylistUuid,
			Name: "Some Playlist",
			// No artists attached - this is what marks it as a plain playlist.
			Artists: nil,
		},
		Score: 0.5,
	}

	var capturedQuery string
	var capturedLimit, capturedOffset uint64
	fakePlaylists := &fakePlaylistStorage{
		searchFn: func(_ context.Context, query string, limit, offset uint64) ([]domain.PlaylistSearchResult, error) {
			capturedQuery = query
			capturedLimit = limit
			capturedOffset = offset
			return []domain.PlaylistSearchResult{album, plainPlaylist}, nil
		},
	}

	svc := &PlaylistService{playlistStorage: fakePlaylists}

	albums, playlists, err := svc.Search(context.Background(), testSearchQuery, 10, 0)
	require.NoError(t, err)

	assert.Equal(t, testSearchQuery, capturedQuery)
	assert.Equal(t, uint64(10), capturedLimit)
	assert.Equal(t, uint64(0), capturedOffset)

	require.Len(t, albums, 1)
	assert.Equal(t, testAlbumUuid, albums[0].Uuid)

	require.Len(t, playlists, 1)
	assert.Equal(t, testPlaylistUuid, playlists[0].Uuid)
}

func TestPlaylistService_Search_EmptyResults(t *testing.T) {
	fakePlaylists := &fakePlaylistStorage{
		searchFn: func(_ context.Context, _ string, _, _ uint64) ([]domain.PlaylistSearchResult, error) {
			return nil, nil
		},
	}

	svc := &PlaylistService{playlistStorage: fakePlaylists}

	albums, playlists, err := svc.Search(context.Background(), "nonexistent", 10, 0)
	require.NoError(t, err)
	assert.Empty(t, albums)
	assert.Empty(t, playlists)
}

func TestPlaylistService_Search_PropagatesStorageError(t *testing.T) {
	fakePlaylists := &fakePlaylistStorage{
		searchFn: func(_ context.Context, _ string, _, _ uint64) ([]domain.PlaylistSearchResult, error) {
			return nil, assert.AnError
		},
	}

	svc := &PlaylistService{playlistStorage: fakePlaylists}

	_, _, err := svc.Search(context.Background(), testSearchQuery, 10, 0)
	require.Error(t, err)
}
