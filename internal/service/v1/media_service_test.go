package v1

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
)

const testMediaFilePath = "artist/a.mp3"

var testRemoteStorageUuid = uuid.MustParse("00000000-0000-0000-0000-0000000000aa")

func newTestMediaService(t *testing.T, storageId uuid.UUID, remote storage.ContentStorage) *MediaService {
	t.Helper()

	fileMetaStorage := newFakeFileMetaStorage()
	meta := domain.FileMeta{}
	meta.FilePath = testMediaFilePath
	meta.StorageId = storageId
	_, err := fileMetaStorage.Add(context.Background(), meta)
	require.NoError(t, err)

	registry := newFakeStorageRegistry(&fakeContentStorage{})
	registry.storages[testRemoteStorageUuid] = remote

	return &MediaService{fileMetaStorage: fileMetaStorage, registry: registry}
}

func Test_MediaService_Resolve_RemoteFileReturnsTarget(t *testing.T) {
	want := domain.RemoteTarget{Url: "https://bucket.example/a.mp3?sig=1", AuthorizationHeader: "Bearer x"}
	remote := &fakeContentStorage{
		resolveFn: func(_ context.Context, path string) (domain.RemoteTarget, error) {
			require.Equal(t, testMediaFilePath, path)
			return want, nil
		},
	}
	svc := newTestMediaService(t, testRemoteStorageUuid, remote)

	got, err := svc.Resolve(context.Background(), "artist/a.mp3")

	require.NoError(t, err)
	require.Equal(t, want, got)
}

func Test_MediaService_Resolve_LocalFileIsNotFound(t *testing.T) {
	svc := newTestMediaService(t, domain.LocalStorageUuid, &fakeContentStorage{})

	_, err := svc.Resolve(context.Background(), "artist/a.mp3")

	require.ErrorIs(t, err, service_errors.ErrNotFound)
}

func Test_MediaService_Resolve_UnknownPathIsNotFound(t *testing.T) {
	svc := newTestMediaService(t, testRemoteStorageUuid, &fakeContentStorage{})

	_, err := svc.Resolve(context.Background(), "artist/missing.mp3")

	require.ErrorIs(t, err, service_errors.ErrNotFound)
}

func Test_MediaService_Resolve_NotRemoteStorageIsNotFound(t *testing.T) {
	remote := &fakeContentStorage{
		resolveFn: func(_ context.Context, _ string) (domain.RemoteTarget, error) {
			return domain.RemoteTarget{}, storage.ErrNotRemote
		},
	}
	svc := newTestMediaService(t, testRemoteStorageUuid, remote)

	_, err := svc.Resolve(context.Background(), "artist/a.mp3")

	require.ErrorIs(t, err, service_errors.ErrNotFound)
}
