package v1

import (
	"context"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
)

type StorageService struct {
	dataStorage   storage.Storage
	registry      storage.StorageRegistry
	secretsKey    string
	publicBaseUrl string
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
	}
}

func (s *StorageService) List(ctx context.Context) ([]domain.StorageInfo, error) {
	err := requireAdministrator(ctx)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return nil, rerrors.Wrap(service_errors.ErrNotImplemented)
}

func (s *StorageService) Create(ctx context.Context, _ domain.CreateStorage) (domain.StorageInfo, error) {
	err := requireAdministrator(ctx)
	if err != nil {
		return domain.StorageInfo{}, rerrors.Wrap(err)
	}

	return domain.StorageInfo{}, rerrors.Wrap(service_errors.ErrNotImplemented)
}

func (s *StorageService) Update(ctx context.Context, _ domain.UpdateStorage) error {
	err := requireAdministrator(ctx)
	if err != nil {
		return rerrors.Wrap(err)
	}

	return rerrors.Wrap(service_errors.ErrNotImplemented)
}

func (s *StorageService) Delete(ctx context.Context, _ uuid.UUID) error {
	err := requireAdministrator(ctx)
	if err != nil {
		return rerrors.Wrap(err)
	}

	return rerrors.Wrap(service_errors.ErrNotImplemented)
}

func (s *StorageService) SetDefault(ctx context.Context, _ uuid.UUID) error {
	err := requireAdministrator(ctx)
	if err != nil {
		return rerrors.Wrap(err)
	}

	return rerrors.Wrap(service_errors.ErrNotImplemented)
}

func (s *StorageService) Test(ctx context.Context, _ uuid.UUID) error {
	err := requireAdministrator(ctx)
	if err != nil {
		return rerrors.Wrap(err)
	}

	return rerrors.Wrap(service_errors.ErrNotImplemented)
}

func (s *StorageService) StartGoogleDriveAuth(ctx context.Context, _ uuid.UUID) (string, error) {
	err := requireAdministrator(ctx)
	if err != nil {
		return "", rerrors.Wrap(err)
	}

	return "", rerrors.Wrap(service_errors.ErrNotImplemented)
}

func (s *StorageService) CompleteGoogleDriveAuth(ctx context.Context, _, _ string) error {
	err := requireAdministrator(ctx)
	if err != nil {
		return rerrors.Wrap(err)
	}

	return rerrors.Wrap(service_errors.ErrNotImplemented)
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
