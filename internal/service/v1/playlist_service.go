package v1

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
)

type PlaylistService struct {
	playlistStorage storage.PlaylistStorage
}

func NewPlaylistService(data storage.Storage) *PlaylistService {
	return &PlaylistService{
		playlistStorage: data.PlaylistStorage(),
	}
}

func (p *PlaylistService) Create(ctx context.Context, req domain.CreatePlaylistReq) (domain.Playlist, error) {
	userCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return domain.Playlist{}, rerrors.Wrap(service_errors.ErrUnauthenticated)
	}

	if !userCtx.Permissions.CanCreatePlaylist {
		return domain.Playlist{}, rerrors.Wrap(service_errors.ErrUnauthorized)
	}

	playlist, err := p.playlistStorage.Create(ctx, req)
	if err != nil {
		return domain.Playlist{}, rerrors.Wrap(err, "error creating playlist in storage")
	}

	return playlist, err
}
