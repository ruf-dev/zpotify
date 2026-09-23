package pg

import (
	"context"
	"database/sql"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/storage/pg/generated/songs_q"
)

type fakeSongsQuerier struct {
	searchFn func(ctx context.Context, arg songs_q.SearchSongsByTitleParams) ([]songs_q.SearchSongsByTitleRow, error)
}

func (f *fakeSongsQuerier) ClearSongArtists(_ context.Context, _ int64) error { return nil }
func (f *fakeSongsQuerier) ClearSongTags(_ context.Context, _ int64) error    { return nil }
func (f *fakeSongsQuerier) CreateSong(_ context.Context, _ songs_q.CreateSongParams) (int64, error) {
	return 0, nil
}
func (f *fakeSongsQuerier) GetArtistsBySongId(_ context.Context, _ int64) ([]songs_q.GetArtistsBySongIdRow, error) {
	return nil, nil
}
func (f *fakeSongsQuerier) GetSongByFileId(_ context.Context, _ int64) (songs_q.SongBaseViewV1, error) {
	return songs_q.SongBaseViewV1{}, nil
}
func (f *fakeSongsQuerier) GetSongById(_ context.Context, _ int64) (songs_q.SongBaseViewV1, error) {
	return songs_q.SongBaseViewV1{}, nil
}
func (f *fakeSongsQuerier) GetSongTags(_ context.Context, _ int64) ([]songs_q.GetSongTagsRow, error) {
	return nil, nil
}
func (f *fakeSongsQuerier) GetSongTgAudioFileId(_ context.Context, _ int64) (sql.NullString, error) {
	return sql.NullString{}, nil
}
func (f *fakeSongsQuerier) UpdateSongTgAudioFileId(_ context.Context, _ songs_q.UpdateSongTgAudioFileIdParams) error {
	return nil
}
func (f *fakeSongsQuerier) InsertSongTag(_ context.Context, _ songs_q.InsertSongTagParams) error {
	return nil
}
func (f *fakeSongsQuerier) ListArtistFeaturedSongs(_ context.Context, _ songs_q.ListArtistFeaturedSongsParams) ([]songs_q.ListArtistFeaturedSongsRow, error) {
	return nil, nil
}
func (f *fakeSongsQuerier) ListArtistPrimarySongs(_ context.Context, _ songs_q.ListArtistPrimarySongsParams) ([]songs_q.ListArtistPrimarySongsRow, error) {
	return nil, nil
}
func (f *fakeSongsQuerier) UpdateSongTitle(_ context.Context, _ songs_q.UpdateSongTitleParams) error {
	return nil
}

func (f *fakeSongsQuerier) SearchSongsByTitle(ctx context.Context, arg songs_q.SearchSongsByTitleParams) ([]songs_q.SearchSongsByTitleRow, error) {
	return f.searchFn(ctx, arg)
}

func baseSearchRow() songs_q.SearchSongsByTitleRow {
	row := songs_q.SearchSongsByTitleRow{
		ID:          1,
		Title:       "Some Song",
		CreatedAt:   time.Now(),
		DurationSec: 180,
		FilePath:    "songs/1.mp3",
		FileID:      1,
		ArtistInfo:  []byte(`[]`),
		Score:       0.5,
	}

	return row
}

func TestSongsStorage_SearchByTitle_MapsAlbumContainer(t *testing.T) {
	playlistUuid := uuid.New()

	row := baseSearchRow()
	row.ContainerPlaylistUuid = uuid.NullUUID{UUID: playlistUuid, Valid: true}
	row.ContainerPlaylistName = sql.NullString{String: "Some Album", Valid: true}
	row.ContainerIsAlbum = sql.NullBool{Bool: true, Valid: true}

	querier := &fakeSongsQuerier{
		searchFn: func(_ context.Context, arg songs_q.SearchSongsByTitleParams) ([]songs_q.SearchSongsByTitleRow, error) {
			assert.Equal(t, int64(42), arg.UserID)
			return []songs_q.SearchSongsByTitleRow{row}, nil
		},
	}

	storage := &SongsStorage{querier: querier}

	songs, err := storage.SearchByTitle(context.Background(), "some", 42, 20, 0)
	require.NoError(t, err)

	require.Len(t, songs, 1)
	require.NotNil(t, songs[0].ContainerPlaylist)
	assert.Equal(t, playlistUuid.String(), songs[0].ContainerPlaylist.Uuid)
	assert.Equal(t, "Some Album", songs[0].ContainerPlaylist.Name)
	assert.True(t, songs[0].ContainerPlaylist.IsAlbum)
}

func TestSongsStorage_SearchByTitle_MapsPlainPlaylistContainer(t *testing.T) {
	playlistUuid := uuid.New()

	row := baseSearchRow()
	row.ContainerPlaylistUuid = uuid.NullUUID{UUID: playlistUuid, Valid: true}
	row.ContainerPlaylistName = sql.NullString{String: "Some Playlist", Valid: true}
	row.ContainerIsAlbum = sql.NullBool{Bool: false, Valid: true}

	querier := &fakeSongsQuerier{
		searchFn: func(_ context.Context, _ songs_q.SearchSongsByTitleParams) ([]songs_q.SearchSongsByTitleRow, error) {
			return []songs_q.SearchSongsByTitleRow{row}, nil
		},
	}

	storage := &SongsStorage{querier: querier}

	songs, err := storage.SearchByTitle(context.Background(), "some", 42, 20, 0)
	require.NoError(t, err)

	require.Len(t, songs, 1)
	require.NotNil(t, songs[0].ContainerPlaylist)
	assert.Equal(t, "Some Playlist", songs[0].ContainerPlaylist.Name)
	assert.False(t, songs[0].ContainerPlaylist.IsAlbum)
}

func TestSongsStorage_SearchByTitle_NoAccessiblePlaylistLeavesContainerNil(t *testing.T) {
	row := baseSearchRow()
	// No accessible/containing playlist found - ContainerPlaylist* columns
	// come back NULL from the LEFT JOIN.

	querier := &fakeSongsQuerier{
		searchFn: func(_ context.Context, _ songs_q.SearchSongsByTitleParams) ([]songs_q.SearchSongsByTitleRow, error) {
			return []songs_q.SearchSongsByTitleRow{row}, nil
		},
	}

	storage := &SongsStorage{querier: querier}

	songs, err := storage.SearchByTitle(context.Background(), "some", 42, 20, 0)
	require.NoError(t, err)

	require.Len(t, songs, 1)
	assert.Nil(t, songs[0].ContainerPlaylist)
}

func TestSongsStorage_SearchByTitle_EmptyQueryReturnsEmptyWithoutCallingStorage(t *testing.T) {
	called := false
	querier := &fakeSongsQuerier{
		searchFn: func(_ context.Context, _ songs_q.SearchSongsByTitleParams) ([]songs_q.SearchSongsByTitleRow, error) {
			called = true
			return nil, nil
		},
	}

	storage := &SongsStorage{querier: querier}

	songs, err := storage.SearchByTitle(context.Background(), "", 42, 20, 0)
	require.NoError(t, err)

	assert.Empty(t, songs)
	assert.False(t, called, "expected SearchByTitle to short-circuit before hitting the querier for a query that produces an empty ts_query")
}
