package v1

import (
	"context"
	"database/sql"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	generated "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

const testSinglePlaylistUuid = "00000000-0000-0000-0000-0000000000aa"

type fakeUserStorage struct {
	permissions domain.PlaylistPermissions
}

func (f *fakeUserStorage) WithTx(_ *sql.Tx) storage.UserStorage { return f }

func (f *fakeUserStorage) CreateUser(_ context.Context, _ domain.UserBaseInfo) (int64, error) {
	return 0, nil
}

func (f *fakeUserStorage) GetUserById(_ context.Context, _ int64) (domain.UserBaseInfo, error) {
	return domain.UserBaseInfo{}, nil
}

func (f *fakeUserStorage) SaveSettings(_ context.Context, _ int64, _ domain.UserUiSettings) error {
	return nil
}

func (f *fakeUserStorage) SavePermissions(_ context.Context, _ int64, _ domain.UserPermissions) error {
	return nil
}

func (f *fakeUserStorage) GetPermissionsOnPlaylist(_ context.Context, _ int64, _ string) (domain.PlaylistPermissions, error) {
	return f.permissions, nil
}

func (f *fakeUserStorage) GetPermissions(_ context.Context, _ int64) (domain.UserPermissions, error) {
	return domain.UserPermissions{}, nil
}

func (f *fakeUserStorage) SetLikedPlaylistId(_ context.Context, _ int64, _ string) error {
	return nil
}

func (f *fakeUserStorage) FollowPlaylist(_ context.Context, _ int64, _ string) error { return nil }

func (f *fakeUserStorage) UnfollowPlaylist(_ context.Context, _ int64, _ string) error { return nil }

type verifiedFileMetaStorage struct {
	*fakeFileMetaStorage
}

func (f *verifiedFileMetaStorage) GetBySongId(_ context.Context, _ int32) (domain.FileMeta, error) {
	meta := domain.FileMeta{}
	meta.Verified = true
	return meta, nil
}

func newPlaylistOfKind(kind generated.PlaylistKind, songCount int32) domain.Playlist {
	return domain.Playlist{Uuid: testSinglePlaylistUuid, Kind: kind, SongCount: &songCount}
}

func newAddSongsRequest(songIds ...int32) domain.AddSongsToPlaylist {
	return domain.AddSongsToPlaylist{PlaylistUuid: testSinglePlaylistUuid, SongIds: songIds}
}

func newAddSongRequest(songId int32) domain.AddSongToPlaylist {
	return domain.AddSongToPlaylist{PlaylistUuid: testSinglePlaylistUuid, SongId: songId}
}

func newPlaylistServiceWithPlaylist(playlist domain.Playlist, addedSongIds *[]int32) *PlaylistService {
	fakePlaylists := &fakePlaylistStorage{
		getFn: func(_ context.Context, _ int64, _ string) (domain.Playlist, error) {
			return playlist, nil
		},
		addSongFn: func(_ context.Context, _ string, songId int32) error {
			*addedSongIds = append(*addedSongIds, songId)
			return nil
		},
	}

	return &PlaylistService{
		playlistStorage: fakePlaylists,
		userStorage:     &fakeUserStorage{permissions: domain.PlaylistPermissions{CanAddSongs: true}},
		fileMetaStorage: &verifiedFileMetaStorage{newFakeFileMetaStorage()},
	}
}

func Test_PlaylistService_AddSongs_SingleRejectsSecondSong(t *testing.T) {
	var added []int32
	svc := newPlaylistServiceWithPlaylist(newPlaylistOfKind(generated.PlaylistKindSINGLE, 1), &added)

	ctx := contextWithPermissions(7, domain.UserPermissions{})

	err := svc.AddSongs(ctx, newAddSongsRequest(2))
	require.ErrorIs(t, err, service_errors.ErrSingleHoldsOneSong)
	assert.Empty(t, added)
}

func Test_PlaylistService_AddSongs_SingleRejectsTwoSongsAtOnce(t *testing.T) {
	var added []int32
	svc := newPlaylistServiceWithPlaylist(newPlaylistOfKind(generated.PlaylistKindSINGLE, 0), &added)

	ctx := contextWithPermissions(7, domain.UserPermissions{})

	err := svc.AddSongs(ctx, newAddSongsRequest(1, 2))
	require.ErrorIs(t, err, service_errors.ErrSingleHoldsOneSong)
	assert.Empty(t, added)
}

func Test_PlaylistService_AddSong_SingleRejectsSecondSong(t *testing.T) {
	var added []int32
	svc := newPlaylistServiceWithPlaylist(newPlaylistOfKind(generated.PlaylistKindSINGLE, 1), &added)

	ctx := contextWithPermissions(7, domain.UserPermissions{})

	err := svc.AddSong(ctx, newAddSongRequest(2))
	require.ErrorIs(t, err, service_errors.ErrSingleHoldsOneSong)
	assert.Empty(t, added)
}

func Test_PlaylistService_AddSong_SingleAcceptsFirstSong(t *testing.T) {
	var added []int32
	svc := newPlaylistServiceWithPlaylist(newPlaylistOfKind(generated.PlaylistKindSINGLE, 0), &added)

	ctx := contextWithPermissions(7, domain.UserPermissions{})

	err := svc.AddSong(ctx, newAddSongRequest(1))
	require.NoError(t, err)
	assert.Equal(t, []int32{1}, added)
}

func Test_PlaylistService_AddSong_PlaylistAcceptsManySongs(t *testing.T) {
	var added []int32
	svc := newPlaylistServiceWithPlaylist(newPlaylistOfKind(generated.PlaylistKindPLAYLIST, 5), &added)

	ctx := contextWithPermissions(7, domain.UserPermissions{})

	err := svc.AddSong(ctx, newAddSongRequest(9))
	require.NoError(t, err)
	assert.Equal(t, []int32{9}, added)
}
