package v1

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
)

const stagedFilePath = "tmp/1/a.mp3"

func Test_PlaceFileInDefaultStorage_TransfersRepointsAndSchedulesSourceCleanup(t *testing.T) {
	ctx := context.Background()
	remoteId := uuid.MustParse("00000000-0000-0000-0000-0000000000bb")

	fileMetaStorage := newFakeFileMetaStorage()
	staged := domain.FileMeta{}
	staged.FilePath = stagedFilePath
	staged.StorageId = domain.LocalStorageUuid
	fileId, err := fileMetaStorage.Add(ctx, staged)
	require.NoError(t, err)
	meta, err := fileMetaStorage.Get(ctx, fileId)
	require.NoError(t, err)

	registry := newFakeStorageRegistry(&fakeContentStorage{})
	registry.defaultId = remoteId
	registry.storages[remoteId] = &fakeContentStorage{}
	jobStorage := newFakeJobStorage()

	err = placeFileInDefaultStorage(ctx, registry, fileMetaStorage, jobStorage, meta, "artist/a.mp3")

	require.NoError(t, err)
	require.Equal(t, []fakeTransfer{{
		fromId: domain.LocalStorageUuid, fromPath: stagedFilePath, toId: remoteId, toPath: "artist/a.mp3",
	}}, registry.transfers)

	moved, err := fileMetaStorage.Get(ctx, fileId)
	require.NoError(t, err)
	require.Equal(t, remoteId, moved.StorageId)
	require.Equal(t, "artist/a.mp3", moved.FilePath)

	require.Equal(t, []string{stagedFilePath}, jobStorage.garbagePaths)
	require.Equal(t, []uuid.UUID{domain.LocalStorageUuid}, jobStorage.garbageStorageIds)
}
