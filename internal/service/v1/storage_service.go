package v1

import (
	"context"
	"database/sql"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/file_storage_providers/gdrive"
	"go.zpotify.ru/zpotify/internal/storage/storage_config"
)

const GoogleDriveCallbackPath = "/wapi/storage/google_drive/callback"

type StorageService struct {
	dataStorage   storage.Storage
	registry      storage.StorageRegistry
	secretsKey    string
	publicBaseUrl string

	runInTx     func(do func(tx *sql.Tx) error) error
	now         func() time.Time
	authCodeUrl func(cfg domain.GoogleDriveConfig, redirectUrl, state string) string
	exchange    func(ctx context.Context, cfg domain.GoogleDriveConfig, redirectUrl, code string) (string, error)
}

func NewStorageService(
	dataStorage storage.Storage,
	registry storage.StorageRegistry,
	secretsKey string,
	publicBaseUrl string,
) *StorageService {
	return &StorageService{
		dataStorage:   dataStorage,
		registry:      registry,
		secretsKey:    secretsKey,
		publicBaseUrl: publicBaseUrl,
		now:           time.Now,
		authCodeUrl:   gdrive.AuthCodeUrl,
		exchange:      gdrive.Exchange,
	}
}

func (s *StorageService) List(ctx context.Context) ([]domain.StorageInfo, error) {
	err := requireAdministrator(ctx)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	rows, err := s.dataStorage.Storages().List(ctx)
	if err != nil {
		return nil, rerrors.Wrap(err, "error listing storages")
	}

	infos := make([]domain.StorageInfo, 0, len(rows))
	for _, row := range rows {
		info := s.toStorageInfo(ctx, row)
		infos = append(infos, info)
	}

	return infos, nil
}

func (s *StorageService) Create(ctx context.Context, req domain.CreateStorage) (domain.StorageInfo, error) {
	err := requireAdministrator(ctx)
	if err != nil {
		return domain.StorageInfo{}, rerrors.Wrap(err)
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		return domain.StorageInfo{}, rerrors.Wrap(service_errors.ErrStorageInvalidConfig, "name is empty")
	}

	cfg := req.Config
	if cfg.GoogleDrive != nil {
		driveCfg := *cfg.GoogleDrive
		driveCfg.RefreshToken = ""
		cfg.GoogleDrive = &driveCfg
	}

	kind, err := validateConfig(cfg)
	if err != nil {
		return domain.StorageInfo{}, rerrors.Wrap(err)
	}

	configEnc, err := storage_config.Encode(s.secretsKey, cfg)
	if err != nil {
		return domain.StorageInfo{}, rerrors.Wrap(err, "error encoding storage config")
	}

	row, err := s.dataStorage.Storages().Create(ctx, name, kind, configEnc)
	if err != nil {
		return domain.StorageInfo{}, rerrors.Wrap(err, "error creating storage")
	}

	return s.toStorageInfo(ctx, row), nil
}

func (s *StorageService) Update(ctx context.Context, req domain.UpdateStorage) error {
	err := requireAdministrator(ctx)
	if err != nil {
		return rerrors.Wrap(err)
	}

	row, err := s.getRow(ctx, req.Uuid)
	if err != nil {
		return rerrors.Wrap(err)
	}

	if row.Kind == domain.StorageKindLocal {
		return rerrors.Wrap(service_errors.ErrStorageInvalidConfig, "local storage is immutable")
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		return rerrors.Wrap(service_errors.ErrStorageInvalidConfig, "name is empty")
	}

	stored, err := storage_config.Decode(s.secretsKey, row.ConfigEnc)
	if err != nil {
		return rerrors.Wrap(err, "error decoding stored storage config")
	}

	merged, err := mergeConfig(row.Kind, stored, req.Config)
	if err != nil {
		return rerrors.Wrap(err)
	}

	configEnc, err := storage_config.Encode(s.secretsKey, merged)
	if err != nil {
		return rerrors.Wrap(err, "error encoding storage config")
	}

	err = s.dataStorage.Storages().Update(ctx, row.Uuid, name, configEnc)
	if err != nil {
		return rerrors.Wrap(err, "error updating storage")
	}

	s.registry.Invalidate(row.Uuid)

	return nil
}

func (s *StorageService) Delete(ctx context.Context, id uuid.UUID) error {
	err := requireAdministrator(ctx)
	if err != nil {
		return rerrors.Wrap(err)
	}

	row, err := s.getRow(ctx, id)
	if err != nil {
		return rerrors.Wrap(err)
	}

	if row.Kind == domain.StorageKindLocal {
		return rerrors.Wrap(service_errors.ErrStorageCannotDeleteLocal)
	}

	if row.IsDefault {
		return rerrors.Wrap(service_errors.ErrStorageCannotDeleteDefault)
	}

	filesCount, err := s.dataStorage.Storages().CountFiles(ctx, id)
	if err != nil {
		return rerrors.Wrap(err, "error counting storage files")
	}

	if filesCount > 0 {
		return rerrors.Wrap(service_errors.ErrStorageNotEmpty)
	}

	err = s.dataStorage.Storages().Delete(ctx, id)
	if err != nil {
		return rerrors.Wrap(err, "error deleting storage")
	}

	s.registry.Invalidate(id)

	return nil
}

func (s *StorageService) SetDefault(ctx context.Context, id uuid.UUID) error {
	err := requireAdministrator(ctx)
	if err != nil {
		return rerrors.Wrap(err)
	}

	row, err := s.getRow(ctx, id)
	if err != nil {
		return rerrors.Wrap(err)
	}

	isConnected, err := s.isConnected(row)
	if err != nil {
		return rerrors.Wrap(err)
	}

	if !isConnected {
		return rerrors.Wrap(service_errors.ErrStorageInvalidConfig, "storage is not connected")
	}

	err = s.inTx(func(tx *sql.Tx) error {
		txErr := s.dataStorage.Storages().WithTx(tx).SetDefault(ctx, id)
		if txErr != nil {
			return rerrors.Wrap(txErr, "error setting default storage")
		}

		return nil
	})
	if err != nil {
		return rerrors.Wrap(err)
	}

	return nil
}

func (s *StorageService) Test(ctx context.Context, id uuid.UUID) error {
	err := requireAdministrator(ctx)
	if err != nil {
		return rerrors.Wrap(err)
	}

	content, err := s.registry.Get(ctx, id)
	if err != nil {
		return rerrors.Wrap(err, "error resolving storage")
	}

	err = content.Probe(ctx)
	if err != nil {
		return rerrors.Wrap(err, "error probing storage")
	}

	return nil
}

func (s *StorageService) StartGoogleDriveAuth(ctx context.Context, id uuid.UUID) (string, error) {
	err := requireAdministrator(ctx)
	if err != nil {
		return "", rerrors.Wrap(err)
	}

	redirectUrl, err := s.googleDriveRedirectUrl()
	if err != nil {
		return "", rerrors.Wrap(err)
	}

	cfg, _, err := s.loadGoogleDriveConfig(ctx, id)
	if err != nil {
		return "", rerrors.Wrap(err)
	}

	state := signOauthState(s.secretsKey, id, s.now())

	return s.authCodeUrl(cfg, redirectUrl, state), nil
}

func (s *StorageService) CompleteGoogleDriveAuth(ctx context.Context, state, code string) error {
	id, err := verifyOauthState(s.secretsKey, state, s.now())
	if err != nil {
		return rerrors.Wrap(err)
	}

	redirectUrl, err := s.googleDriveRedirectUrl()
	if err != nil {
		return rerrors.Wrap(err)
	}

	cfg, row, err := s.loadGoogleDriveConfig(ctx, id)
	if err != nil {
		return rerrors.Wrap(err)
	}

	refreshToken, err := s.exchange(ctx, cfg, redirectUrl, code)
	if err != nil {
		return rerrors.Wrap(err, "error exchanging google drive code")
	}

	if refreshToken == "" {
		return rerrors.Wrap(service_errors.ErrStorageInvalidConfig, "google drive returned no refresh token")
	}

	cfg.RefreshToken = refreshToken
	stored := domain.StorageConfig{GoogleDrive: &cfg}

	configEnc, err := storage_config.Encode(s.secretsKey, stored)
	if err != nil {
		return rerrors.Wrap(err, "error encoding storage config")
	}

	err = s.dataStorage.Storages().Update(ctx, row.Uuid, row.Name, configEnc)
	if err != nil {
		return rerrors.Wrap(err, "error updating storage")
	}

	s.registry.Invalidate(row.Uuid)

	return nil
}

func (s *StorageService) inTx(do func(tx *sql.Tx) error) error {
	var err error
	if s.runInTx != nil {
		err = s.runInTx(do)
	} else {
		err = s.dataStorage.TxManager().Execute(do)
	}
	if err != nil {
		return rerrors.Wrap(err)
	}

	return nil
}

func (s *StorageService) getRow(ctx context.Context, id uuid.UUID) (storage.StorageRow, error) {
	row, err := s.dataStorage.Storages().Get(ctx, id)
	if err != nil {
		return storage.StorageRow{}, rerrors.Wrap(err, "error getting storage")
	}

	if !row.Valid {
		return storage.StorageRow{}, rerrors.Wrap(service_errors.ErrStorageNotFound)
	}

	return row.V, nil
}

func (s *StorageService) loadGoogleDriveConfig(
	ctx context.Context,
	id uuid.UUID,
) (domain.GoogleDriveConfig, storage.StorageRow, error) {
	row, err := s.getRow(ctx, id)
	if err != nil {
		return domain.GoogleDriveConfig{}, storage.StorageRow{}, rerrors.Wrap(err)
	}

	if row.Kind != domain.StorageKindGoogleDrive {
		return domain.GoogleDriveConfig{}, storage.StorageRow{}, rerrors.Wrap(
			service_errors.ErrStorageInvalidConfig, "storage is not google drive",
		)
	}

	cfg, err := storage_config.Decode(s.secretsKey, row.ConfigEnc)
	if err != nil {
		return domain.GoogleDriveConfig{}, storage.StorageRow{}, rerrors.Wrap(err, "error decoding storage config")
	}

	if cfg.GoogleDrive == nil {
		return domain.GoogleDriveConfig{}, storage.StorageRow{}, rerrors.Wrap(service_errors.ErrStorageInvalidConfig)
	}

	return *cfg.GoogleDrive, row, nil
}

func (s *StorageService) googleDriveRedirectUrl() (string, error) {
	baseUrl := strings.TrimRight(s.publicBaseUrl, "/")
	if baseUrl == "" {
		return "", rerrors.Wrap(service_errors.ErrStorageInvalidConfig, "public base url is not configured")
	}

	return baseUrl + GoogleDriveCallbackPath, nil
}

func (s *StorageService) isConnected(row storage.StorageRow) (bool, error) {
	if row.Kind != domain.StorageKindGoogleDrive {
		return true, nil
	}

	cfg, err := storage_config.Decode(s.secretsKey, row.ConfigEnc)
	if err != nil {
		return false, rerrors.Wrap(err, "error decoding storage config")
	}

	return isConfigConnected(row.Kind, cfg), nil
}

func (s *StorageService) toStorageInfo(ctx context.Context, row storage.StorageRow) domain.StorageInfo {
	info := domain.StorageInfo{
		Uuid:       row.Uuid,
		Name:       row.Name,
		Kind:       row.Kind,
		IsDefault:  row.IsDefault,
		UsedBytes:  row.UsedBytes,
		QuotaBytes: row.QuotaBytes,
	}

	if row.Kind == domain.StorageKindLocal {
		info.IsConnected = true

		return info
	}

	cfg, err := storage_config.Decode(s.secretsKey, row.ConfigEnc)
	if err != nil {
		log.Ctx(ctx).Warn().
			Str("storage_uuid", row.Uuid.String()).
			Err(err).
			Msg("error decoding storage config")

		info.IsConnected = row.Kind != domain.StorageKindGoogleDrive

		return info
	}

	info.IsConnected = isConfigConnected(row.Kind, cfg)
	info.Config = redactSecrets(cfg)

	return info
}

func isConfigConnected(kind domain.StorageKind, cfg domain.StorageConfig) bool {
	if kind != domain.StorageKindGoogleDrive {
		return true
	}

	return cfg.GoogleDrive != nil && cfg.GoogleDrive.RefreshToken != ""
}

func redactSecrets(cfg domain.StorageConfig) domain.StorageConfig {
	var redacted domain.StorageConfig

	if cfg.S3 != nil {
		s3Cfg := *cfg.S3
		s3Cfg.SecretAccessKey = ""
		redacted.S3 = &s3Cfg
	}

	if cfg.Webdav != nil {
		webdavCfg := *cfg.Webdav
		webdavCfg.Password = ""
		redacted.Webdav = &webdavCfg
	}

	if cfg.GoogleDrive != nil {
		driveCfg := *cfg.GoogleDrive
		driveCfg.ClientSecret = ""
		driveCfg.RefreshToken = ""
		redacted.GoogleDrive = &driveCfg
	}

	return redacted
}

func kindOfConfig(cfg domain.StorageConfig) (domain.StorageKind, bool) {
	var kinds []domain.StorageKind

	if cfg.S3 != nil {
		kinds = append(kinds, domain.StorageKindS3)
	}
	if cfg.Webdav != nil {
		kinds = append(kinds, domain.StorageKindWebdav)
	}
	if cfg.GoogleDrive != nil {
		kinds = append(kinds, domain.StorageKindGoogleDrive)
	}

	if len(kinds) != 1 {
		return "", false
	}

	return kinds[0], true
}

func validateConfig(cfg domain.StorageConfig) (domain.StorageKind, error) {
	kind, ok := kindOfConfig(cfg)
	if !ok {
		return "", rerrors.Wrap(service_errors.ErrStorageInvalidConfig, "exactly one storage config is required")
	}

	var isValid bool
	switch kind {
	case domain.StorageKindLocal:
		return "", rerrors.Wrap(service_errors.ErrStorageInvalidConfig, "local storage has no config")
	case domain.StorageKindS3:
		isValid = cfg.S3.Endpoint != "" &&
			cfg.S3.Bucket != "" &&
			cfg.S3.AccessKeyId != "" &&
			cfg.S3.SecretAccessKey != ""
	case domain.StorageKindWebdav:
		isValid = cfg.Webdav.Url != ""
	case domain.StorageKindGoogleDrive:
		isValid = cfg.GoogleDrive.ClientId != "" && cfg.GoogleDrive.ClientSecret != ""
	}

	if !isValid {
		return "", rerrors.Wrap(service_errors.ErrStorageInvalidConfig, "required config fields are empty")
	}

	return kind, nil
}

func mergeConfig(
	kind domain.StorageKind,
	stored domain.StorageConfig,
	incoming domain.StorageConfig,
) (domain.StorageConfig, error) {
	incomingKind, ok := kindOfConfig(incoming)
	if !ok || incomingKind != kind {
		return domain.StorageConfig{}, rerrors.Wrap(service_errors.ErrStorageInvalidConfig, "config kind mismatch")
	}

	var merged domain.StorageConfig

	switch kind {
	case domain.StorageKindLocal:
		return domain.StorageConfig{}, rerrors.Wrap(service_errors.ErrStorageInvalidConfig, "local storage has no config")
	case domain.StorageKindS3:
		s3Cfg := *incoming.S3
		if s3Cfg.SecretAccessKey == "" && stored.S3 != nil {
			s3Cfg.SecretAccessKey = stored.S3.SecretAccessKey
		}
		merged.S3 = &s3Cfg
	case domain.StorageKindWebdav:
		webdavCfg := *incoming.Webdav
		if webdavCfg.Password == "" && stored.Webdav != nil {
			webdavCfg.Password = stored.Webdav.Password
		}
		merged.Webdav = &webdavCfg
	case domain.StorageKindGoogleDrive:
		driveCfg := *incoming.GoogleDrive
		driveCfg.RefreshToken = ""
		if stored.GoogleDrive != nil {
			isClientChanged := driveCfg.ClientId != stored.GoogleDrive.ClientId
			if driveCfg.ClientSecret == "" && !isClientChanged {
				driveCfg.ClientSecret = stored.GoogleDrive.ClientSecret
			}
			if !isClientChanged {
				driveCfg.RefreshToken = stored.GoogleDrive.RefreshToken
			}
		}
		merged.GoogleDrive = &driveCfg
	}

	_, err := validateConfig(merged)
	if err != nil {
		return domain.StorageConfig{}, rerrors.Wrap(err)
	}

	return merged, nil
}

func requireAdministrator(ctx context.Context) error {
	userCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return rerrors.Wrap(service_errors.ErrUnauthenticated)
	}

	if !userCtx.Permissions.IsAdministrator {
		return rerrors.Wrap(service_errors.ErrUnauthorized)
	}

	return nil
}
