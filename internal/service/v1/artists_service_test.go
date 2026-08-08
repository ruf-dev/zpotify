package v1

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
)

func contextWithPermissions(userId int64, permissions domain.UserPermissions) context.Context {
	uc := user_context.UserContext{
		UserId:      userId,
		Permissions: permissions,
	}
	return user_context.WithUserContext(context.Background(), uc)
}

func TestArtistsService_Update_RequiresCanEditArtists(t *testing.T) {
	svc := &ArtistsService{}

	ctx := contextWithPermissions(1, domain.UserPermissions{CanEditArtists: false})

	_, err := svc.Update(ctx, domain.UpdateArtistParams{Uuid: "artist-uuid", Name: "New Name"})
	require.Error(t, err, "expected update to be rejected without CanEditArtists")
}

func TestArtistsService_Update_RequiresAuthentication(t *testing.T) {
	svc := &ArtistsService{}

	_, err := svc.Update(context.Background(), domain.UpdateArtistParams{Uuid: "artist-uuid"})
	require.Error(t, err, "expected update to be rejected without a user context")
}

func TestArtistsService_GetArtistPage_SetsCanEditFromUserPermissions(t *testing.T) {
	tests := []struct {
		name           string
		canEditArtists bool
	}{
		{name: "granted", canEditArtists: true},
		{name: "not granted", canEditArtists: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fakeArtist := &fakeArtistStorage{
				getFn: func(_ context.Context, artistUuid string, userId int64) (domain.Artist, error) {
					assert.Equal(t, "artist-uuid", artistUuid)
					assert.Equal(t, int64(7), userId)

					artist := domain.Artist{
						ArtistsBase: domain.ArtistsBase{Uuid: artistUuid, Name: "Test Artist"},
					}
					return artist, nil
				},
			}

			svc := &ArtistsService{
				artistStorage:   fakeArtist,
				playlistStorage: &fakePlaylistStorage{},
				songStorage:     &fakeSongStorage{},
			}

			permissions := domain.UserPermissions{CanEditArtists: tt.canEditArtists}
			ctx := contextWithPermissions(7, permissions)

			page, err := svc.GetArtistPage(ctx, "artist-uuid")
			require.NoError(t, err)

			assert.Equal(t, tt.canEditArtists, page.Artist.CanEdit)
		})
	}
}

func TestArtistsService_Search_DelegatesToStorage(t *testing.T) {
	expected := []domain.ArtistsBase{{Uuid: "artist-uuid", Name: "Some Artist"}}

	var capturedQuery string
	var capturedLimit, capturedOffset uint64
	fakeArtist := &fakeArtistStorage{
		searchFn: func(_ context.Context, query string, limit, offset uint64) ([]domain.ArtistSearchResult, error) {
			capturedQuery = query
			capturedLimit = limit
			capturedOffset = offset

			results := make([]domain.ArtistSearchResult, len(expected))
			for i, a := range expected {
				results[i] = domain.ArtistSearchResult{ArtistsBase: a, Score: 0.75}
			}
			return results, nil
		},
	}

	svc := &ArtistsService{artistStorage: fakeArtist}

	results, err := svc.Search(context.Background(), "some", 20, 5)
	require.NoError(t, err)

	assert.Equal(t, "some", capturedQuery)
	assert.Equal(t, uint64(20), capturedLimit)
	assert.Equal(t, uint64(5), capturedOffset)

	require.Len(t, results, 1)
	assert.Equal(t, "artist-uuid", results[0].Uuid)
	assert.Equal(t, 0.75, results[0].Score)
}

func TestArtistsService_Search_PropagatesStorageError(t *testing.T) {
	fakeArtist := &fakeArtistStorage{
		searchFn: func(_ context.Context, _ string, _, _ uint64) ([]domain.ArtistSearchResult, error) {
			return nil, assert.AnError
		},
	}

	svc := &ArtistsService{artistStorage: fakeArtist}

	_, err := svc.Search(context.Background(), "some", 20, 0)
	require.Error(t, err)
}

func TestArtistsService_GetArtistPage_UsesRoleAndStandaloneFiltersPerRow(t *testing.T) {
	fakeArtist := &fakeArtistStorage{
		getFn: func(_ context.Context, artistUuid string, _ int64) (domain.Artist, error) {
			return domain.Artist{ArtistsBase: domain.ArtistsBase{Uuid: artistUuid}}, nil
		},
	}

	var albumsReq domain.ListPlaylists
	fakePlaylists := &fakePlaylistStorage{
		listFn: func(_ context.Context, req domain.ListPlaylists) ([]domain.Playlist, error) {
			albumsReq = req
			return nil, nil
		},
	}

	var singlesReq, featuresReq domain.ListSongsByArtist
	callCount := 0
	fakeSongs := &fakeSongStorage{
		listByArtistFn: func(_ context.Context, req domain.ListSongsByArtist) ([]domain.Song, error) {
			callCount++
			if req.Role == domain.ArtistSongRolePrimary {
				singlesReq = req
			} else {
				featuresReq = req
			}
			return nil, nil
		},
	}

	svc := &ArtistsService{
		artistStorage:   fakeArtist,
		playlistStorage: fakePlaylists,
		songStorage:     fakeSongs,
	}

	ctx := contextWithPermissions(7, domain.UserPermissions{})

	_, err := svc.GetArtistPage(ctx, "artist-uuid")
	require.NoError(t, err)

	require.Equal(t, 2, callCount, "expected ListByArtist to be called once for singles and once for features")

	assert.True(t, albumsReq.Filter.ArtistUuid.Valid)
	assert.Equal(t, "artist-uuid", albumsReq.Filter.ArtistUuid.V)

	assert.Equal(t, domain.ArtistSongRolePrimary, singlesReq.Role)
	assert.True(t, singlesReq.StandaloneOnly, "singles must be scoped to standalone tracks")
	assert.Equal(t, "artist-uuid", singlesReq.ArtistUuid)

	assert.Equal(t, domain.ArtistSongRoleFeatured, featuresReq.Role)
	assert.False(t, featuresReq.StandaloneOnly, "features must not require standalone tracks")
	assert.Equal(t, "artist-uuid", featuresReq.ArtistUuid)
}
