package search_api_impl

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
)

func TestToPbArtistResults_SetsAvatarFilePathWhenPresent(t *testing.T) {
	artists := []domain.ArtistSearchResult{
		{
			ArtistsBase:    domain.ArtistsBase{Uuid: "artist-uuid", Name: "Some Artist"},
			AvatarFilePath: "artists/artist-uuid/avatar.png",
			Score:          0.75,
		},
	}

	results := toPbArtistResults(artists)

	require.Len(t, results, 1)
	require.NotNil(t, results[0].Artist.AvatarFilePath)
	assert.Equal(t, "artists/artist-uuid/avatar.png", *results[0].Artist.AvatarFilePath)
	assert.Equal(t, "artist-uuid", results[0].Artist.Uuid)
	assert.Equal(t, 0.75, results[0].Score)
}

func TestToPbArtistResults_LeavesAvatarFilePathNilWhenEmpty(t *testing.T) {
	artists := []domain.ArtistSearchResult{
		{
			ArtistsBase: domain.ArtistsBase{Uuid: "artist-uuid", Name: "Some Artist"},
			Score:       0.5,
		},
	}

	results := toPbArtistResults(artists)

	require.Len(t, results, 1)
	assert.Nil(t, results[0].Artist.AvatarFilePath)
}
