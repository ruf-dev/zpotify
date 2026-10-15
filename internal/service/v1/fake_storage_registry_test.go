package v1

import (
	"context"
	"io"
	"strings"

	"github.com/google/uuid"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

type fakeContentStorage struct {
	getFn     func(ctx context.Context, path string) (io.ReadCloser, error)
	resolveFn func(ctx context.Context, path string) (domain.RemoteTarget, error)
}

func (f *fakeContentStorage) Put(_ context.Context, _ string, _ io.Reader) error {
	return nil
}

func (f *fakeContentStorage) Get(ctx context.Context, path string) (io.ReadCloser, error) {
	if f.getFn == nil {
		return io.NopCloser(strings.NewReader("")), nil
	}
	return f.getFn(ctx, path)
}

func (f *fakeContentStorage) Copy(_ context.Context, _, _ string) error {
	return nil
}

func (f *fakeContentStorage) Delete(_ context.Context, _ string) error {
	return nil
}

func (f *fakeContentStorage) Resolve(ctx context.Context, path string) (domain.RemoteTarget, error) {
	if f.resolveFn == nil {
		return domain.RemoteTarget{}, nil
	}
	return f.resolveFn(ctx, path)
}

func (f *fakeContentStorage) Probe(_ context.Context) error {
	return nil
}

type fakeTransfer struct {
	fromId   uuid.UUID
	fromPath string
	toId     uuid.UUID
	toPath   string
}

type fakeStorageRegistry struct {
	storages  map[uuid.UUID]storage.ContentStorage
	defaultId uuid.UUID
	transfers []fakeTransfer
}

func newFakeStorageRegistry(local storage.ContentStorage) *fakeStorageRegistry {
	return &fakeStorageRegistry{
		storages:  map[uuid.UUID]storage.ContentStorage{domain.LocalStorageUuid: local},
		defaultId: domain.LocalStorageUuid,
	}
}

func (f *fakeStorageRegistry) Get(_ context.Context, storageId uuid.UUID) (storage.ContentStorage, error) {
	content, ok := f.storages[storageId]
	if !ok {
		return nil, storage.ErrNotFound
	}
	return content, nil
}

func (f *fakeStorageRegistry) Default(_ context.Context) (uuid.UUID, storage.ContentStorage, error) {
	return f.defaultId, f.storages[f.defaultId], nil
}

func (f *fakeStorageRegistry) Invalidate(_ uuid.UUID) {}

func (f *fakeStorageRegistry) Transfer(_ context.Context, fromId uuid.UUID, fromPath string, toId uuid.UUID, toPath string) error {
	transfer := fakeTransfer{fromId: fromId, fromPath: fromPath, toId: toId, toPath: toPath}
	f.transfers = append(f.transfers, transfer)
	return nil
}
