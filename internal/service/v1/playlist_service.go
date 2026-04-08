package v1

import (
	"context"

	"go.redsock.ru/rerrors"
	"go.redsock.ru/toolbox"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

type PlaylistService struct {
	playlistStorage storage.PlaylistStorage
	songsStorage    storage.SongStorage
}

func NewPlaylistService(data storage.Storage) *PlaylistService {
	return &PlaylistService{
		playlistStorage: data.PlaylistStorage(),
		songsStorage:    data.SongsStorage(),
	}
}

func (p *PlaylistService) ListSongs(ctx context.Context, req domain.ListSongs) (domain.SongsInPlaylist, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	if req.PlaylistUuid == nil {
		req.PlaylistUuid = toolbox.ToPtr(domain.GlobalPlaylistUuid)
	}

	songsBase, err := p.playlistStorage.ListSongs(ctx, req)
	if err != nil {
		return domain.SongsInPlaylist{}, rerrors.Wrap(err, "error listing songs for playlist from storage")
	}

	total, err := p.playlistStorage.CountSongs(ctx, req)
	if err != nil {
		return domain.SongsInPlaylist{}, rerrors.Wrap(err, "error counting songs in playlist from storage")
	}

	_ = songsBase

	return domain.SongsInPlaylist{
		Songs: []domain.PlaylistSong{},
		Total: total,
	}, nil
}

//func (p *PlaylistService) Get(ctx context.Context, playlistUuid string) (domain.Playlist, error) {
//	userCtx, ok := user_context.GetUserContext(ctx)
//	if !ok {
//		return domain.Playlist{}, rerrors.Wrap(service_errors.ErrUnauthenticated)
//	}
//
//	uuidParsed, err := uuid.Parse(playlistUuid)
//	if err != nil {
//		return domain.Playlist{}, rerrors.Wrap(err, "error parsing playlist uuid")
//	}
//
//	storaageParams := querier.GetPlaylistWithAuthParams{
//		UserID: int16(userCtx.UserId),
//		Uuid:   uuidParsed,
//	}
//
//	playlist, err := p.playlistStorage.GetWithAuth(ctx, storaageParams)
//	if err != nil {
//		return playlist, rerrors.Wrap(err, "error reading playlist info")
//	}
//
//	return playlist, nil
//}

//func (p *PlaylistService) Create(ctx context.Context, req domain.CreatePlaylistParams) (domain.Playlist, error) {
//	userCtx, ok := user_context.GetUserContext(ctx)
//	if !ok {
//		return domain.Playlist{}, rerrors.Wrap(service_errors.ErrUnauthenticated)
//	}
//
//	if !userCtx.Permissions.CanCreatePlaylist {
//		return domain.Playlist{}, rerrors.Wrap(service_errors.ErrUnauthorized)
//	}
//
//	createPlaylistParams := querier.CreatePlaylistParams{
//		Name:        req.Name,
//		Description: req.Description,
//		UserID:      int16(userCtx.UserId),
//	}
//
//	playlist, err := p.playlistStorage.Create(ctx, createPlaylistParams)
//	if err != nil {
//		return domain.Playlist{}, rerrors.Wrap(err, "error creating playlist in storage")
//	}
//
//	return playlist, err
//}
