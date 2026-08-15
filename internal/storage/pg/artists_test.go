package pg

import (
	"context"
	"database/sql"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/storage/pg/generated/artists_q"
)

type fakeArtistsQuerier struct {
	searchFn func(ctx context.Context, arg artists_q.SearchArtistsByNameParams) ([]artists_q.SearchArtistsByNameRow, error)
}

func (f *fakeArtistsQuerier) LikeArtist(_ context.Context, _ artists_q.LikeArtistParams) error {
	return nil
}

func (f *fakeArtistsQuerier) UnlikeArtist(_ context.Context, _ artists_q.UnlikeArtistParams) error {
	return nil
}

func (f *fakeArtistsQuerier) SearchArtistsByName(ctx context.Context, arg artists_q.SearchArtistsByNameParams) ([]artists_q.SearchArtistsByNameRow, error) {
	return f.searchFn(ctx, arg)
}

func TestArtistsStorage_Search_MapsAvatarFilePathWhenPresent(t *testing.T) {
	artistUuid := uuid.New()
	createdAt := time.Now()

	querier := &fakeArtistsQuerier{
		searchFn: func(_ context.Context, _ artists_q.SearchArtistsByNameParams) ([]artists_q.SearchArtistsByNameRow, error) {
			row := artists_q.SearchArtistsByNameRow{
				Uuid:           artistUuid,
				Name:           "Some Artist",
				CreatedAt:      createdAt,
				AvatarFilePath: sql.NullString{String: "artists/some-artist/avatar.png", Valid: true},
				Score:          0.5,
			}
			return []artists_q.SearchArtistsByNameRow{row}, nil
		},
	}

	storage := &ArtistsStorage{querier: querier}

	results, err := storage.Search(context.Background(), "some", 20, 0)
	require.NoError(t, err)

	require.Len(t, results, 1)
	assert.Equal(t, artistUuid.String(), results[0].Uuid)
	assert.Equal(t, "artists/some-artist/avatar.png", results[0].AvatarFilePath)
}

func TestArtistsStorage_Search_LeavesAvatarFilePathEmptyWhenNull(t *testing.T) {
	artistUuid := uuid.New()

	querier := &fakeArtistsQuerier{
		searchFn: func(_ context.Context, _ artists_q.SearchArtistsByNameParams) ([]artists_q.SearchArtistsByNameRow, error) {
			row := artists_q.SearchArtistsByNameRow{
				Uuid:           artistUuid,
				Name:           "Some Artist",
				CreatedAt:      time.Now(),
				AvatarFilePath: sql.NullString{Valid: false},
				Score:          0.5,
			}
			return []artists_q.SearchArtistsByNameRow{row}, nil
		},
	}

	storage := &ArtistsStorage{querier: querier}

	results, err := storage.Search(context.Background(), "some", 20, 0)
	require.NoError(t, err)

	require.Len(t, results, 1)
	assert.Empty(t, results[0].AvatarFilePath)
}

func TestArtistsStorage_Search_EmptyQueryReturnsEmptyWithoutCallingStorage(t *testing.T) {
	called := false
	querier := &fakeArtistsQuerier{
		searchFn: func(_ context.Context, _ artists_q.SearchArtistsByNameParams) ([]artists_q.SearchArtistsByNameRow, error) {
			called = true
			return nil, nil
		},
	}

	storage := &ArtistsStorage{querier: querier}

	results, err := storage.Search(context.Background(), "", 20, 0)
	require.NoError(t, err)

	assert.Empty(t, results)
	assert.False(t, called, "expected storage.Search to short-circuit before hitting the querier for a query that produces an empty ts_query")
}
