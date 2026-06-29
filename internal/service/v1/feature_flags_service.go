package v1

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

type FeatureFlagsService struct {
	flagsStorage storage.FeatureFlagsStorage
}

func NewFeatureFlagsService(dataStorage storage.Storage) *FeatureFlagsService {
	return &FeatureFlagsService{
		flagsStorage: dataStorage.FeatureFlags(),
	}
}

func (s *FeatureFlagsService) GetAll(ctx context.Context) ([]domain.FeatureFlag, error) {
	flags, err := s.flagsStorage.GetAll(ctx)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return flags, nil
}
