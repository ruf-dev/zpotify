package file_storage_providers

import (
	"context"
	"database/sql"
	"io"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/storage_config"
)

const registryTestKey = "registry-test-key"

type fakeContentStorage struct {
	name string
}

func (f *fakeContentStorage) Put(_ context.Context, _ string, _ io.Reader) error { return nil }

func (f *fakeContentStorage) Get(_ context.Context, _ string) (io.ReadCloser, error) {
	return nil, nil
}

func (f *fakeContentStorage) Copy(_ context.Context, _, _ string) error { return nil }

func (f *fakeContentStorage) Delete(_ context.Context, _ string) error { return nil }

func (f *fakeContentStorage) Resolve(_ context.Context, _ string) (domain.RemoteTarget, error) {
	return domain.RemoteTarget{}, nil
}

func (f *fakeContentStorage) Probe(_ context.Context) error { return nil }

type fakeStoragesStorage struct {
	rows       map[uuid.UUID]storage.StorageRow
	defaultRow storage.StorageRow
	getCalls   int
}

func (f *fakeStoragesStorage) WithTx(_ *sql.Tx) storage.StoragesStorage { return f }

func (f *fakeStoragesStorage) List(_ context.Context) ([]storage.StorageRow, error) {
	return nil, nil
}

func (f *fakeStoragesStorage) Get(_ context.Context, id uuid.UUID) (sql.Null[storage.StorageRow], error) {
	f.getCalls++

	row, ok := f.rows[id]
	if !ok {
		return sql.Null[storage.StorageRow]{}, nil
	}

	return sql.Null[storage.StorageRow]{V: row, Valid: true}, nil
}

func (f *fakeStoragesStorage) GetDefault(_ context.Context) (storage.StorageRow, error) {
	return f.defaultRow, nil
}

func (f *fakeStoragesStorage) Create(
	_ context.Context, _ string, _ domain.StorageKind, _ []byte,
) (storage.StorageRow, error) {
	return storage.StorageRow{}, nil
}

func (f *fakeStoragesStorage) Update(_ context.Context, _ uuid.UUID, _ string, _ []byte) error {
	return nil
}

func (f *fakeStoragesStorage) Delete(_ context.Context, _ uuid.UUID) error { return nil }

func (f *fakeStoragesStorage) SetDefault(_ context.Context, _ uuid.UUID) error { return nil }

func (f *fakeStoragesStorage) CountFiles(_ context.Context, _ uuid.UUID) (int64, error) {
	return 0, nil
}

func (f *fakeStoragesStorage) GetUsedBytes(_ context.Context, _ uuid.UUID) (int64, error) {
	return 0, nil
}

type registryFixture struct {
	registry *Registry
	storages *fakeStoragesStorage
	local    *fakeContentStorage
	s3Calls  int
	rowId    uuid.UUID
}

func newRegistryFixture(t *testing.T) *registryFixture {
	t.Helper()

	cfg := domain.StorageConfig{S3: &domain.S3Config{Bucket: "music"}}
	blob, err := storage_config.Encode(registryTestKey, cfg)
	require.NoError(t, err)

	rowId := uuid.New()
	row := storage.StorageRow{Uuid: rowId, Name: "s3", Kind: domain.StorageKindS3, ConfigEnc: blob}

	storages := &fakeStoragesStorage{
		rows:       map[uuid.UUID]storage.StorageRow{rowId: row},
		defaultRow: row,
	}
	local := &fakeContentStorage{name: "local"}

	fixture := &registryFixture{
		storages: storages,
		local:    local,
		registry: NewRegistry(storages, local, registryTestKey),
		rowId:    rowId,
	}

	fixture.registry.newS3 = func(_ context.Context, got domain.S3Config) (storage.ContentStorage, error) {
		fixture.s3Calls++
		return &fakeContentStorage{name: got.Bucket}, nil
	}

	return fixture
}

func Test_Registry_LocalIdReturnsLocal(t *testing.T) {
	fixture := newRegistryFixture(t)

	got, err := fixture.registry.Get(context.Background(), domain.LocalStorageUuid)
	require.NoError(t, err)
	require.Same(t, fixture.local, got)
	require.Zero(t, fixture.storages.getCalls)
}

func Test_Registry_GetCachesProvider(t *testing.T) {
	fixture := newRegistryFixture(t)

	first, err := fixture.registry.Get(context.Background(), fixture.rowId)
	require.NoError(t, err)

	second, err := fixture.registry.Get(context.Background(), fixture.rowId)
	require.NoError(t, err)

	require.Same(t, first, second)
	require.Equal(t, 1, fixture.s3Calls)
	require.Equal(t, 1, fixture.storages.getCalls)
}

func Test_Registry_InvalidateRebuildsProvider(t *testing.T) {
	fixture := newRegistryFixture(t)

	_, err := fixture.registry.Get(context.Background(), fixture.rowId)
	require.NoError(t, err)

	fixture.registry.Invalidate(fixture.rowId)

	_, err = fixture.registry.Get(context.Background(), fixture.rowId)
	require.NoError(t, err)

	require.Equal(t, 2, fixture.s3Calls)
}

func Test_Registry_UnknownIdIsNotFound(t *testing.T) {
	fixture := newRegistryFixture(t)

	_, err := fixture.registry.Get(context.Background(), uuid.New())
	require.ErrorIs(t, err, service_errors.ErrStorageNotFound)
}

func Test_Registry_LocalKindWithForeignIdIsInvalid(t *testing.T) {
	fixture := newRegistryFixture(t)

	foreignId := uuid.New()
	fixture.storages.rows[foreignId] = storage.StorageRow{Uuid: foreignId, Kind: domain.StorageKindLocal}

	_, err := fixture.registry.Get(context.Background(), foreignId)
	require.ErrorIs(t, err, service_errors.ErrStorageInvalidConfig)
}

func Test_Registry_DefaultResolvesDefaultRow(t *testing.T) {
	fixture := newRegistryFixture(t)

	id, got, err := fixture.registry.Default(context.Background())
	require.NoError(t, err)
	require.Equal(t, fixture.rowId, id)
	fake, ok := got.(*fakeContentStorage)
	require.True(t, ok)
	require.Equal(t, "music", fake.name)
}
