package v1

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

type ArtistsService struct {
	storage storage.Storage
}

func NewArtistsService(storage storage.Storage) *ArtistsService {
	return &ArtistsService{
		storage: storage,
	}
}

func (s *ArtistsService) List(ctx context.Context, req domain.ListArtists) ([]domain.ArtistsBase, error) {
	artists, err := s.storage.ArtistStorage().List(ctx, req)
	if err != nil {
		return nil, rerrors.Wrap(err, "error listing artists")
	}

	return artists, nil
}
