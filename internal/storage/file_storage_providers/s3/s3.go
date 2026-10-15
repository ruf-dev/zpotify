package s3

import (
	"context"
	"io"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
)

type Storage struct{}

func New(_ context.Context, _ domain.S3Config) (storage.ContentStorage, error) {
	return &Storage{}, nil
}

func (s *Storage) Put(_ context.Context, _ string, _ io.Reader) error {
	return rerrors.Wrap(service_errors.ErrNotImplemented)
}

func (s *Storage) Get(_ context.Context, _ string) (io.ReadCloser, error) {
	return nil, rerrors.Wrap(service_errors.ErrNotImplemented)
}

func (s *Storage) Copy(_ context.Context, _, _ string) error {
	return rerrors.Wrap(service_errors.ErrNotImplemented)
}

func (s *Storage) Delete(_ context.Context, _ string) error {
	return rerrors.Wrap(service_errors.ErrNotImplemented)
}

func (s *Storage) Resolve(_ context.Context, _ string) (domain.RemoteTarget, error) {
	return domain.RemoteTarget{}, rerrors.Wrap(service_errors.ErrNotImplemented)
}

func (s *Storage) Probe(_ context.Context) error {
	return rerrors.Wrap(service_errors.ErrNotImplemented)
}
