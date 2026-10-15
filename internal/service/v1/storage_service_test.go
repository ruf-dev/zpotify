package v1

import (
	"context"
	"database/sql"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/storage_config"
)

const (
	storageTestKey = "storage-test-key"
	testDriveName  = "drive"
)

type fakeStoragesRepo struct {
	rows            map[uuid.UUID]storage.StorageRow
	filesCount      int64
	defaultSetId    uuid.UUID
	deletedIds      []uuid.UUID
	updatedConfigs  map[uuid.UUID][]byte
	createdConfigEn []byte
}

func newFakeStoragesRepo() *fakeStoragesRepo {
	return &fakeStoragesRepo{
		rows:           make(map[uuid.UUID]storage.StorageRow),
		updatedConfigs: make(map[uuid.UUID][]byte),
	}
}

func (f *fakeStoragesRepo) WithTx(_ *sql.Tx) storage.StoragesStorage { return f }

func (f *fakeStoragesRepo) List(_ context.Context) ([]storage.StorageRow, error) {
	out := make([]storage.StorageRow, 0, len(f.rows))
	for _, row := range f.rows {
		out = append(out, row)
	}

	return out, nil
}

func (f *fakeStoragesRepo) Get(_ context.Context, id uuid.UUID) (sql.Null[storage.StorageRow], error) {
	row, ok := f.rows[id]
	if !ok {
		return sql.Null[storage.StorageRow]{}, nil
	}

	return sql.Null[storage.StorageRow]{V: row, Valid: true}, nil
}

func (f *fakeStoragesRepo) GetDefault(_ context.Context) (storage.StorageRow, error) {
	return storage.StorageRow{}, nil
}

func (f *fakeStoragesRepo) Create(
	_ context.Context, name string, kind domain.StorageKind, configEnc []byte,
) (storage.StorageRow, error) {
	row := storage.StorageRow{Uuid: uuid.New(), Name: name, Kind: kind, ConfigEnc: configEnc}
	f.rows[row.Uuid] = row
	f.createdConfigEn = configEnc

	return row, nil
}

func (f *fakeStoragesRepo) Update(_ context.Context, id uuid.UUID, name string, configEnc []byte) error {
	row := f.rows[id]
	row.Name = name
	row.ConfigEnc = configEnc
	f.rows[id] = row
	f.updatedConfigs[id] = configEnc

	return nil
}

func (f *fakeStoragesRepo) Delete(_ context.Context, id uuid.UUID) error {
	delete(f.rows, id)
	f.deletedIds = append(f.deletedIds, id)

	return nil
}

func (f *fakeStoragesRepo) SetDefault(_ context.Context, id uuid.UUID) error {
	f.defaultSetId = id

	return nil
}

func (f *fakeStoragesRepo) CountFiles(_ context.Context, _ uuid.UUID) (int64, error) {
	return f.filesCount, nil
}

func (f *fakeStoragesRepo) GetUsedBytes(_ context.Context, _ uuid.UUID) (int64, error) {
	return 0, nil
}

type fakeStorageDataStorage struct {
	storage.Storage
	repo *fakeStoragesRepo
}

func (f *fakeStorageDataStorage) Storages() storage.StoragesStorage { return f.repo }

type fakeAdminStorageRegistry struct {
	invalidated []uuid.UUID
	probeErr    error
}

func (f *fakeAdminStorageRegistry) Get(_ context.Context, _ uuid.UUID) (storage.ContentStorage, error) {
	return &fakeAdminProbeStorage{probeErr: f.probeErr}, nil
}

func (f *fakeAdminStorageRegistry) Default(_ context.Context) (uuid.UUID, storage.ContentStorage, error) {
	return uuid.Nil, nil, nil
}

func (f *fakeAdminStorageRegistry) Invalidate(id uuid.UUID) {
	f.invalidated = append(f.invalidated, id)
}

func (f *fakeAdminStorageRegistry) Transfer(_ context.Context, _ uuid.UUID, _ string, _ uuid.UUID, _ string) error {
	return nil
}

type fakeAdminProbeStorage struct {
	storage.ContentStorage
	probeErr error
}

func (f *fakeAdminProbeStorage) Probe(_ context.Context) error { return f.probeErr }

type storageFixture struct {
	svc      *StorageService
	repo     *fakeStoragesRepo
	registry *fakeAdminStorageRegistry
	now      time.Time
}

func newStorageFixture() *storageFixture {
	repo := newFakeStoragesRepo()
	registry := &fakeAdminStorageRegistry{}
	now := time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)

	dataStorage := &fakeStorageDataStorage{repo: repo}
	svc := NewStorageService(dataStorage, registry, storageTestKey, "https://zpotify.example.com/")
	svc.now = func() time.Time { return now }
	svc.runInTx = func(do func(tx *sql.Tx) error) error { return do(nil) }

	return &storageFixture{svc: svc, repo: repo, registry: registry, now: now}
}

func (f *storageFixture) addRow(t *testing.T, kind domain.StorageKind, name string, cfg domain.StorageConfig) storage.StorageRow {
	t.Helper()

	var blob []byte
	if kind != domain.StorageKindLocal {
		encoded, err := storage_config.Encode(storageTestKey, cfg)
		require.NoError(t, err)
		blob = encoded
	}

	row := storage.StorageRow{Uuid: uuid.New(), Name: name, Kind: kind, ConfigEnc: blob}
	f.repo.rows[row.Uuid] = row

	return row
}

func (f *storageFixture) decodeStored(t *testing.T, id uuid.UUID) domain.StorageConfig {
	t.Helper()

	cfg, err := storage_config.Decode(storageTestKey, f.repo.rows[id].ConfigEnc)
	require.NoError(t, err)

	return cfg
}

func adminStorageCtx() context.Context {
	userCtx := user_context.UserContext{
		UserId:      1,
		Permissions: domain.UserPermissions{IsAdministrator: true},
	}

	return user_context.WithUserContext(context.Background(), userCtx)
}

func plainUserStorageCtx() context.Context {
	userCtx := user_context.UserContext{UserId: 2}

	return user_context.WithUserContext(context.Background(), userCtx)
}

func newS3Config() domain.StorageConfig {
	return domain.StorageConfig{S3: &domain.S3Config{
		Endpoint:        "https://s3.example.com",
		Bucket:          "music",
		AccessKeyId:     "ak",
		SecretAccessKey: "sk",
	}}
}

func newDriveConfig(refreshToken string) domain.StorageConfig {
	return domain.StorageConfig{GoogleDrive: &domain.GoogleDriveConfig{
		ClientId:     "cid",
		ClientSecret: "csecret",
		RefreshToken: refreshToken,
	}}
}

func Test_StorageService_AdminGate(t *testing.T) {
	fixture := newStorageFixture()
	id := uuid.New()

	calls := map[string]func(ctx context.Context) error{
		"list": func(ctx context.Context) error {
			_, err := fixture.svc.List(ctx)
			return err
		},
		"create": func(ctx context.Context) error {
			_, err := fixture.svc.Create(ctx, domain.CreateStorage{})
			return err
		},
		"update": func(ctx context.Context) error {
			return fixture.svc.Update(ctx, domain.UpdateStorage{})
		},
		"delete":      func(ctx context.Context) error { return fixture.svc.Delete(ctx, id) },
		"set default": func(ctx context.Context) error { return fixture.svc.SetDefault(ctx, id) },
		"test":        func(ctx context.Context) error { return fixture.svc.Test(ctx, id) },
		"start auth": func(ctx context.Context) error {
			_, err := fixture.svc.StartGoogleDriveAuth(ctx, id)
			return err
		},
	}

	for name, call := range calls {
		t.Run(name+" non admin", func(t *testing.T) {
			require.ErrorIs(t, call(plainUserStorageCtx()), service_errors.ErrUnauthorized)
		})
		t.Run(name+" anonymous", func(t *testing.T) {
			require.ErrorIs(t, call(context.Background()), service_errors.ErrUnauthenticated)
		})
	}
}

func Test_StorageService_CreateValidation(t *testing.T) {
	cases := []struct {
		name    string
		req     domain.CreateStorage
		wantErr error
	}{
		{"valid s3", domain.CreateStorage{Name: "s3", Config: newS3Config()}, nil},
		{"empty name", domain.CreateStorage{Name: " ", Config: newS3Config()}, service_errors.ErrStorageInvalidConfig},
		{"no variant", domain.CreateStorage{Name: "x"}, service_errors.ErrStorageInvalidConfig},
		{
			"two variants",
			domain.CreateStorage{Name: "x", Config: domain.StorageConfig{
				S3:     newS3Config().S3,
				Webdav: &domain.WebdavConfig{Url: "https://dav"},
			}},
			service_errors.ErrStorageInvalidConfig,
		},
		{
			"s3 without bucket",
			domain.CreateStorage{Name: "x", Config: domain.StorageConfig{S3: &domain.S3Config{
				Endpoint: "e", AccessKeyId: "a", SecretAccessKey: "s",
			}}},
			service_errors.ErrStorageInvalidConfig,
		},
		{
			"webdav without url",
			domain.CreateStorage{Name: "x", Config: domain.StorageConfig{Webdav: &domain.WebdavConfig{}}},
			service_errors.ErrStorageInvalidConfig,
		},
		{
			"drive without secret",
			domain.CreateStorage{Name: "x", Config: domain.StorageConfig{
				GoogleDrive: &domain.GoogleDriveConfig{ClientId: "c"},
			}},
			service_errors.ErrStorageInvalidConfig,
		},
		{"valid drive", domain.CreateStorage{Name: "d", Config: newDriveConfig("")}, nil},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			fixture := newStorageFixture()

			info, err := fixture.svc.Create(adminStorageCtx(), tc.req)
			if tc.wantErr != nil {
				require.ErrorIs(t, err, tc.wantErr)
				return
			}

			require.NoError(t, err)
			require.NotEqual(t, uuid.Nil, info.Uuid)
		})
	}
}

func Test_StorageService_CreateDerivesKindAndDropsClientRefreshToken(t *testing.T) {
	fixture := newStorageFixture()

	req := domain.CreateStorage{Name: testDriveName, Config: newDriveConfig("smuggled")}
	info, err := fixture.svc.Create(adminStorageCtx(), req)
	require.NoError(t, err)

	require.Equal(t, domain.StorageKindGoogleDrive, info.Kind)
	require.False(t, info.IsConnected)
	require.Empty(t, fixture.decodeStored(t, info.Uuid).GoogleDrive.RefreshToken)
}

func Test_StorageService_UpdateKeepsEmptySecrets(t *testing.T) {
	fixture := newStorageFixture()
	row := fixture.addRow(t, domain.StorageKindS3, "s3", newS3Config())

	incoming := newS3Config()
	incoming.S3.SecretAccessKey = ""
	incoming.S3.Bucket = "renamed-bucket"

	req := domain.UpdateStorage{Uuid: row.Uuid, Name: "s3 renamed", Config: incoming}
	err := fixture.svc.Update(adminStorageCtx(), req)
	require.NoError(t, err)

	stored := fixture.decodeStored(t, row.Uuid)
	require.Equal(t, "sk", stored.S3.SecretAccessKey)
	require.Equal(t, "renamed-bucket", stored.S3.Bucket)
	require.Equal(t, "s3 renamed", fixture.repo.rows[row.Uuid].Name)
	require.Equal(t, []uuid.UUID{row.Uuid}, fixture.registry.invalidated)
}

func Test_StorageService_UpdateWebdavKeepsPassword(t *testing.T) {
	fixture := newStorageFixture()
	row := fixture.addRow(t, domain.StorageKindWebdav, "dav", domain.StorageConfig{
		Webdav: &domain.WebdavConfig{Url: "https://dav", Username: "u", Password: "secret"},
	})

	incoming := domain.StorageConfig{Webdav: &domain.WebdavConfig{Url: "https://dav2", Username: "u"}}
	err := fixture.svc.Update(adminStorageCtx(), domain.UpdateStorage{Uuid: row.Uuid, Name: "dav", Config: incoming})
	require.NoError(t, err)

	stored := fixture.decodeStored(t, row.Uuid)
	require.Equal(t, "secret", stored.Webdav.Password)
	require.Equal(t, "https://dav2", stored.Webdav.Url)
}

func Test_StorageService_UpdateDrivePreservesRefreshToken(t *testing.T) {
	fixture := newStorageFixture()
	row := fixture.addRow(t, domain.StorageKindGoogleDrive, testDriveName, newDriveConfig("refresh"))

	incoming := newDriveConfig("client-supplied")
	incoming.GoogleDrive.ClientSecret = ""
	incoming.GoogleDrive.RootFolderId = "folder"

	err := fixture.svc.Update(adminStorageCtx(), domain.UpdateStorage{Uuid: row.Uuid, Name: testDriveName, Config: incoming})
	require.NoError(t, err)

	stored := fixture.decodeStored(t, row.Uuid)
	require.Equal(t, "refresh", stored.GoogleDrive.RefreshToken)
	require.Equal(t, "csecret", stored.GoogleDrive.ClientSecret)
	require.Equal(t, "folder", stored.GoogleDrive.RootFolderId)
}

func Test_StorageService_UpdateDriveClientIdChangeClearsRefreshToken(t *testing.T) {
	fixture := newStorageFixture()
	row := fixture.addRow(t, domain.StorageKindGoogleDrive, testDriveName, newDriveConfig("refresh"))

	incoming := newDriveConfig("")
	incoming.GoogleDrive.ClientId = "other-client"
	incoming.GoogleDrive.ClientSecret = "other-secret"

	err := fixture.svc.Update(adminStorageCtx(), domain.UpdateStorage{Uuid: row.Uuid, Name: testDriveName, Config: incoming})
	require.NoError(t, err)

	require.Empty(t, fixture.decodeStored(t, row.Uuid).GoogleDrive.RefreshToken)
}

func Test_StorageService_UpdateRejections(t *testing.T) {
	fixture := newStorageFixture()
	s3Row := fixture.addRow(t, domain.StorageKindS3, "s3", newS3Config())
	localRow := fixture.addRow(t, domain.StorageKindLocal, "local", domain.StorageConfig{})

	cases := []struct {
		name    string
		req     domain.UpdateStorage
		wantErr error
	}{
		{"not found", domain.UpdateStorage{Uuid: uuid.New(), Name: "x", Config: newS3Config()}, service_errors.ErrStorageNotFound},
		{"local is immutable", domain.UpdateStorage{Uuid: localRow.Uuid, Name: "x"}, service_errors.ErrStorageInvalidConfig},
		{"kind cannot change", domain.UpdateStorage{Uuid: s3Row.Uuid, Name: "x", Config: newDriveConfig("")}, service_errors.ErrStorageInvalidConfig},
		{"empty name", domain.UpdateStorage{Uuid: s3Row.Uuid, Name: "", Config: newS3Config()}, service_errors.ErrStorageInvalidConfig},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			err := fixture.svc.Update(adminStorageCtx(), tc.req)
			require.ErrorIs(t, err, tc.wantErr)
		})
	}
}

func Test_StorageService_DeleteGuards(t *testing.T) {
	fixture := newStorageFixture()
	localRow := fixture.addRow(t, domain.StorageKindLocal, "local", domain.StorageConfig{})
	defaultRow := fixture.addRow(t, domain.StorageKindS3, "default", newS3Config())
	defaultRow.IsDefault = true
	fixture.repo.rows[defaultRow.Uuid] = defaultRow
	plainRow := fixture.addRow(t, domain.StorageKindS3, "plain", newS3Config())

	err := fixture.svc.Delete(adminStorageCtx(), uuid.New())
	require.ErrorIs(t, err, service_errors.ErrStorageNotFound)

	err = fixture.svc.Delete(adminStorageCtx(), localRow.Uuid)
	require.ErrorIs(t, err, service_errors.ErrStorageCannotDeleteLocal)

	err = fixture.svc.Delete(adminStorageCtx(), defaultRow.Uuid)
	require.ErrorIs(t, err, service_errors.ErrStorageCannotDeleteDefault)

	fixture.repo.filesCount = 3
	err = fixture.svc.Delete(adminStorageCtx(), plainRow.Uuid)
	require.ErrorIs(t, err, service_errors.ErrStorageNotEmpty)
	require.Empty(t, fixture.repo.deletedIds)

	fixture.repo.filesCount = 0
	err = fixture.svc.Delete(adminStorageCtx(), plainRow.Uuid)
	require.NoError(t, err)
	require.Equal(t, []uuid.UUID{plainRow.Uuid}, fixture.repo.deletedIds)
	require.Equal(t, []uuid.UUID{plainRow.Uuid}, fixture.registry.invalidated)
}

func Test_StorageService_ListReportsDriveConnection(t *testing.T) {
	fixture := newStorageFixture()
	connected := fixture.addRow(t, domain.StorageKindGoogleDrive, "connected", newDriveConfig("refresh"))
	pending := fixture.addRow(t, domain.StorageKindGoogleDrive, "pending", newDriveConfig(""))
	local := fixture.addRow(t, domain.StorageKindLocal, "local", domain.StorageConfig{})

	infos, err := fixture.svc.List(adminStorageCtx())
	require.NoError(t, err)

	byId := make(map[uuid.UUID]domain.StorageInfo, len(infos))
	for _, info := range infos {
		byId[info.Uuid] = info
	}

	require.True(t, byId[connected.Uuid].IsConnected)
	require.False(t, byId[pending.Uuid].IsConnected)
	require.True(t, byId[local.Uuid].IsConnected)
}

func Test_StorageService_SetDefaultRequiresConnectedDrive(t *testing.T) {
	fixture := newStorageFixture()
	pending := fixture.addRow(t, domain.StorageKindGoogleDrive, "pending", newDriveConfig(""))
	connected := fixture.addRow(t, domain.StorageKindGoogleDrive, "connected", newDriveConfig("refresh"))

	err := fixture.svc.SetDefault(adminStorageCtx(), pending.Uuid)
	require.ErrorIs(t, err, service_errors.ErrStorageInvalidConfig)

	err = fixture.svc.SetDefault(adminStorageCtx(), connected.Uuid)
	require.NoError(t, err)
	require.Equal(t, connected.Uuid, fixture.repo.defaultSetId)

	err = fixture.svc.SetDefault(adminStorageCtx(), uuid.New())
	require.ErrorIs(t, err, service_errors.ErrStorageNotFound)
}

func Test_StorageService_TestWrapsProbeError(t *testing.T) {
	fixture := newStorageFixture()

	err := fixture.svc.Test(adminStorageCtx(), uuid.New())
	require.NoError(t, err)

	fixture.registry.probeErr = service_errors.ErrStorageInvalidConfig
	err = fixture.svc.Test(adminStorageCtx(), uuid.New())
	require.ErrorIs(t, err, service_errors.ErrStorageInvalidConfig)
}

func Test_StorageService_GoogleDriveAuthFlow(t *testing.T) {
	fixture := newStorageFixture()
	row := fixture.addRow(t, domain.StorageKindGoogleDrive, testDriveName, newDriveConfig(""))

	var gotRedirectUrl, gotState string
	fixture.svc.authCodeUrl = func(_ domain.GoogleDriveConfig, redirectUrl, state string) string {
		gotRedirectUrl = redirectUrl
		gotState = state
		return "https://consent.example.com"
	}
	fixture.svc.exchange = func(_ context.Context, cfg domain.GoogleDriveConfig, _, code string) (string, error) {
		require.Equal(t, "cid", cfg.ClientId)
		require.Equal(t, "the-code", code)
		return "new-refresh", nil
	}

	consentUrl, err := fixture.svc.StartGoogleDriveAuth(adminStorageCtx(), row.Uuid)
	require.NoError(t, err)
	require.Equal(t, "https://consent.example.com", consentUrl)
	require.Equal(t, "https://zpotify.example.com"+GoogleDriveCallbackPath, gotRedirectUrl)

	err = fixture.svc.CompleteGoogleDriveAuth(context.Background(), gotState, "the-code")
	require.NoError(t, err)

	stored := fixture.decodeStored(t, row.Uuid)
	require.Equal(t, "new-refresh", stored.GoogleDrive.RefreshToken)
	require.Equal(t, "csecret", stored.GoogleDrive.ClientSecret)
	require.Equal(t, []uuid.UUID{row.Uuid}, fixture.registry.invalidated)
}

func Test_StorageService_CompleteGoogleDriveAuthRejectsBadState(t *testing.T) {
	fixture := newStorageFixture()
	row := fixture.addRow(t, domain.StorageKindGoogleDrive, testDriveName, newDriveConfig(""))

	expired := signOauthState(storageTestKey, row.Uuid, fixture.now.Add(-time.Hour))
	err := fixture.svc.CompleteGoogleDriveAuth(context.Background(), expired, "code")
	require.ErrorIs(t, err, service_errors.ErrUnauthorized)

	err = fixture.svc.CompleteGoogleDriveAuth(context.Background(), "garbage", "code")
	require.ErrorIs(t, err, service_errors.ErrUnauthorized)
}

func Test_StorageService_StartGoogleDriveAuthRejections(t *testing.T) {
	fixture := newStorageFixture()
	s3Row := fixture.addRow(t, domain.StorageKindS3, "s3", newS3Config())
	driveRow := fixture.addRow(t, domain.StorageKindGoogleDrive, testDriveName, newDriveConfig(""))

	_, err := fixture.svc.StartGoogleDriveAuth(adminStorageCtx(), s3Row.Uuid)
	require.ErrorIs(t, err, service_errors.ErrStorageInvalidConfig)

	_, err = fixture.svc.StartGoogleDriveAuth(adminStorageCtx(), uuid.New())
	require.ErrorIs(t, err, service_errors.ErrStorageNotFound)

	fixture.svc.publicBaseUrl = ""
	_, err = fixture.svc.StartGoogleDriveAuth(adminStorageCtx(), driveRow.Uuid)
	require.ErrorIs(t, err, service_errors.ErrStorageInvalidConfig)
}
