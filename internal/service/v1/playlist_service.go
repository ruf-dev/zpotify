package v1

import (
	"context"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	querier "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

type PlaylistService struct {
	playlistStorage storage.PlaylistStorage
}

func NewPlaylistService(data storage.Storage) *PlaylistService {
	return &PlaylistService{
		playlistStorage: data.PlaylistStorage(),
	}
}

func (p *PlaylistService) Create(ctx context.Context, req domain.CreatePlaylistParams) (domain.Playlist, error) {
	userCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return domain.Playlist{}, rerrors.Wrap(service_errors.ErrUnauthenticated)
	}

	if !userCtx.Permissions.CanCreatePlaylist {
		return domain.Playlist{}, rerrors.Wrap(service_errors.ErrUnauthorized)
	}

	createPlaylistParams := querier.CreatePlaylistParams{
		Name:        req.Name,
		Description: req.Description,
		UserTgID:    userCtx.TgUserId,
	}

	playlist, err := p.playlistStorage.Create(ctx, createPlaylistParams)
	if err != nil {
		return domain.Playlist{}, rerrors.Wrap(err, "error creating playlist in storage")
	}

	return playlist, err
}

func (p *PlaylistService) Get(ctx context.Context, playlistUuid string) (domain.Playlist, error) {
	userCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return domain.Playlist{}, rerrors.Wrap(service_errors.ErrUnauthenticated)
	}

	uuidParsed, err := uuid.Parse(playlistUuid)
	if err != nil {
		return domain.Playlist{}, rerrors.Wrap(err, "error parsing playlist uuid")
	}

	storaageParams := querier.GetPlaylistWithAuthParams{
		UserTgID: userCtx.TgUserId,
		Uuid:     uuidParsed,
	}

	playlist, err := p.playlistStorage.GetWithAuth(ctx, storaageParams)
	if err != nil {
		return playlist, rerrors.Wrap(err, "error reading playlist info")
	}

	return playlist, nil
}
