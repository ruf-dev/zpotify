package v1

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
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

func (s *ArtistsService) Create(ctx context.Context, name string) (domain.ArtistsBase, error) {
	artists, err := s.storage.ArtistStorage().Return(ctx, []string{name})
	if err != nil {
		return domain.ArtistsBase{}, rerrors.Wrap(err, "error creating artist")
	}

	return artists[0], nil
}

func (s *ArtistsService) LikeArtist(ctx context.Context, artistUuid string) error {
	userCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return rerrors.Wrap(service_errors.ErrUnauthenticated)
	}

	err := s.storage.ArtistStorage().LikeArtist(ctx, userCtx.UserId, artistUuid)
	if err != nil {
		return rerrors.Wrap(err, "error liking artist")
	}

	return nil
}

func (s *ArtistsService) UnlikeArtist(ctx context.Context, artistUuid string) error {
	userCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return rerrors.Wrap(service_errors.ErrUnauthenticated)
	}

	err := s.storage.ArtistStorage().UnlikeArtist(ctx, userCtx.UserId, artistUuid)
	if err != nil {
		return rerrors.Wrap(err, "error unliking artist")
	}

	return nil
}
