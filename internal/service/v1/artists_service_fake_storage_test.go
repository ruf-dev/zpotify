package v1

import (
	"context"
	"database/sql"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/songs_q"
)

// fakeArtistStorage is an in-memory test double for storage.ArtistStorage.
// Every method delegates to an optional function field so each test only
// wires up the behaviour it cares about; unset functions return zero values.
type fakeArtistStorage struct {
	getFn                         func(ctx context.Context, artistUuid string, userId int64) (domain.Artist, error)
	updateFn                      func(ctx context.Context, params domain.UpdateArtistParams) error
	updateAvatarFileIdFn          func(ctx context.Context, artistUuid string, fileId int64) error
	updateBackgroundCoverFileIdFn func(ctx context.Context, artistUuid string, fileId int64) error
	searchFn                      func(ctx context.Context, query string, limit, offset uint64) ([]domain.ArtistSearchResult, error)
}

func (f *fakeArtistStorage) Return(_ context.Context, _ []string) ([]domain.ArtistsBase, error) {
	return nil, nil
}

func (f *fakeArtistStorage) List(_ context.Context, _ domain.ListArtists) ([]domain.ArtistsBase, error) {
	return nil, nil
}

func (f *fakeArtistStorage) Get(ctx context.Context, artistUuid string, userId int64) (domain.Artist, error) {
	if f.getFn == nil {
		return domain.Artist{}, nil
	}
	return f.getFn(ctx, artistUuid, userId)
}

func (f *fakeArtistStorage) Update(ctx context.Context, params domain.UpdateArtistParams) error {
	if f.updateFn == nil {
		return nil
	}
	return f.updateFn(ctx, params)
}

func (f *fakeArtistStorage) UpdateAvatarFileId(ctx context.Context, artistUuid string, fileId int64) error {
	if f.updateAvatarFileIdFn == nil {
		return nil
	}
	return f.updateAvatarFileIdFn(ctx, artistUuid, fileId)
}

func (f *fakeArtistStorage) UpdateBackgroundCoverFileId(ctx context.Context, artistUuid string, fileId int64) error {
	if f.updateBackgroundCoverFileIdFn == nil {
		return nil
	}
	return f.updateBackgroundCoverFileIdFn(ctx, artistUuid, fileId)
}

func (f *fakeArtistStorage) LikeArtist(_ context.Context, _ int64, _ string) error {
	return nil
}

func (f *fakeArtistStorage) Search(ctx context.Context, query string, limit, offset uint64) ([]domain.ArtistSearchResult, error) {
	if f.searchFn == nil {
		return nil, nil
	}
	return f.searchFn(ctx, query, limit, offset)
}

func (f *fakeArtistStorage) UnlikeArtist(_ context.Context, _ int64, _ string) error {
	return nil
}

func (f *fakeArtistStorage) WithTx(_ *sql.Tx) storage.ArtistStorage {
	return f
}

// fakePlaylistStorage is an in-memory test double for storage.PlaylistStorage.
// Only List is exercised by ArtistsService tests; every other method is a
// harmless no-op/zero-value implementation to satisfy the interface.
type fakePlaylistStorage struct {
	listFn   func(ctx context.Context, req domain.ListPlaylists) ([]domain.Playlist, error)
	searchFn func(ctx context.Context, query string, limit, offset uint64) ([]domain.PlaylistSearchResult, error)
}

func (f *fakePlaylistStorage) Create(_ context.Context, _ domain.CreatePlaylistParams, _ int64) (string, error) {
	return "", nil
}

func (f *fakePlaylistStorage) Get(_ context.Context, _ int64, _ string) (domain.Playlist, error) {
	return domain.Playlist{}, nil
}

func (f *fakePlaylistStorage) Update(_ context.Context, _ domain.UpdatePlaylistParams) error {
	return nil
}

func (f *fakePlaylistStorage) GetPlaylistArtists(_ context.Context, _ string) ([]domain.ArtistsBase, error) {
	return nil, nil
}

func (f *fakePlaylistStorage) AddPlaylistArtist(_ context.Context, _, _ string, _ int) error {
	return nil
}

func (f *fakePlaylistStorage) ClearPlaylistArtists(_ context.Context, _ string) error {
	return nil
}

func (f *fakePlaylistStorage) UpdateCoverFileId(_ context.Context, _ string, _ int64) error {
	return nil
}

func (f *fakePlaylistStorage) GetAlbumTags(_ context.Context, _ string) ([]domain.AlbumTag, error) {
	return nil, nil
}

func (f *fakePlaylistStorage) InsertAlbumTag(_ context.Context, _ string, _ domain.AlbumTag, _ int) error {
	return nil
}

func (f *fakePlaylistStorage) ClearAlbumTags(_ context.Context, _ string) error {
	return nil
}

func (f *fakePlaylistStorage) ListSongs(_ context.Context, _ domain.ListSongs) ([]domain.PlaylistSong, error) {
	return nil, nil
}

func (f *fakePlaylistStorage) CountSongs(_ context.Context, _ domain.ListSongs) (uint16, error) {
	return 0, nil
}

func (f *fakePlaylistStorage) AddSong(_ context.Context, _ string, _ int32) error {
	return nil
}

func (f *fakePlaylistStorage) RemoveSong(_ context.Context, _ string, _ int32) error {
	return nil
}

func (f *fakePlaylistStorage) SetSongOrder(_ context.Context, _ string, _ int64, _ int64) error {
	return nil
}

func (f *fakePlaylistStorage) List(ctx context.Context, req domain.ListPlaylists) ([]domain.Playlist, error) {
	if f.listFn == nil {
		return nil, nil
	}
	return f.listFn(ctx, req)
}

func (f *fakePlaylistStorage) CountPlaylists(_ context.Context, _ domain.ListPlaylists) (uint32, error) {
	return 0, nil
}

func (f *fakePlaylistStorage) GetOwnerAndVisibility(_ context.Context, _ string) (int64, bool, error) {
	return 0, false, nil
}

func (f *fakePlaylistStorage) Search(ctx context.Context, query string, limit, offset uint64) ([]domain.PlaylistSearchResult, error) {
	if f.searchFn == nil {
		return nil, nil
	}
	return f.searchFn(ctx, query, limit, offset)
}

func (f *fakePlaylistStorage) WithTx(_ *sql.Tx) storage.PlaylistStorage {
	return f
}

// fakeSongStorage is an in-memory test double for storage.SongStorage. Only
// ListByArtist is exercised by ArtistsService tests; getByIdFn/getSongTagsFn
// are additionally used by AudioService tests.
type fakeSongStorage struct {
	listByArtistFn func(ctx context.Context, req domain.ListSongsByArtist) ([]domain.Song, error)
	getByIdFn      func(ctx context.Context, songId int64) (domain.Song, error)
	getSongTagsFn  func(ctx context.Context, songId int64) ([]domain.SongTag, error)
}

func (f *fakeSongStorage) GetById(ctx context.Context, songId int64) (domain.Song, error) {
	if f.getByIdFn == nil {
		return domain.Song{}, nil
	}
	return f.getByIdFn(ctx, songId)
}

func (f *fakeSongStorage) GetByFileId(_ context.Context, _ int64) (domain.Song, error) {
	return domain.Song{}, nil
}

func (f *fakeSongStorage) SearchByTitle(_ context.Context, _ string, _, _ uint64) ([]domain.Song, error) {
	return nil, nil
}

func (f *fakeSongStorage) Create(_ context.Context, _ songs_q.CreateSongParams) (int64, error) {
	return 0, nil
}

func (f *fakeSongStorage) CreateBatch(_ context.Context, _ []songs_q.CreateSongParams) ([]int64, error) {
	return nil, nil
}

func (f *fakeSongStorage) UpdateTitle(_ context.Context, _ int64, _ string) error {
	return nil
}

func (f *fakeSongStorage) ClearArtists(_ context.Context, _ int64) error {
	return nil
}

func (f *fakeSongStorage) AddArtist(_ context.Context, _ int64, _ string, _ int) error {
	return nil
}

func (f *fakeSongStorage) GetSongTags(ctx context.Context, songId int64) ([]domain.SongTag, error) {
	if f.getSongTagsFn == nil {
		return nil, nil
	}
	return f.getSongTagsFn(ctx, songId)
}

func (f *fakeSongStorage) InsertSongTag(_ context.Context, _ int64, _ domain.SongTag, _ int) error {
	return nil
}

func (f *fakeSongStorage) ClearSongTags(_ context.Context, _ int64) error {
	return nil
}

func (f *fakeSongStorage) ListByArtist(ctx context.Context, req domain.ListSongsByArtist) ([]domain.Song, error) {
	if f.listByArtistFn == nil {
		return nil, nil
	}
	return f.listByArtistFn(ctx, req)
}

func (f *fakeSongStorage) WithTx(_ *sql.Tx) storage.SongStorage {
	return f
}
