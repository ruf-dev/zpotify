package v1

import (
	"context"

	"go.redsock.ru/rerrors"
	"go.redsock.ru/toolbox"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
)

type PlaylistService struct {
	playlistStorage storage.PlaylistStorage
	userStorage     storage.UserStorage
	fileMetaStorage storage.FileMetaStorage
}

func NewPlaylistService(data storage.Storage) *PlaylistService {
	return &PlaylistService{
		playlistStorage: data.PlaylistStorage(),

		userStorage: data.User(),

		fileMetaStorage: data.FileMeta(),
	}
}

func (p *PlaylistService) ListSongs(ctx context.Context, req domain.ListSongs) (domain.SongsInPlaylist, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	if req.PlaylistUuid == nil {
		req.PlaylistUuid = toolbox.ToPtr(domain.GlobalPlaylistUuid)
	}

	songs, err := p.playlistStorage.ListSongs(ctx, req)
	if err != nil {
		return domain.SongsInPlaylist{}, rerrors.Wrap(err, "error listing songs for playlist from storage")
	}

	total, err := p.playlistStorage.CountSongs(ctx, req)
	if err != nil {
		return domain.SongsInPlaylist{}, rerrors.Wrap(err, "error counting songs in playlist from storage")
	}

	return domain.SongsInPlaylist{
		Songs: songs,
		Total: total,
	}, nil
}

func (p *PlaylistService) AddSong(ctx context.Context, req domain.AddSongToPlaylist) error {
	userCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return rerrors.Wrap(service_errors.ErrUnauthenticated)
	}

	permissions, err := p.userStorage.GetPermissionsOnPlaylist(ctx, userCtx.UserId, req.PlaylistUuid)
	if err != nil {
		return rerrors.Wrap(err, "error getting permissions for playlist")
	}

	if !permissions.CanAddSongs {
		return rerrors.Wrap(service_errors.ErrUnauthorized)
	}

	songFile, err := p.fileMetaStorage.GetBySongId(ctx, req.SongId)
	if err != nil {
		return rerrors.Wrap(err, "error getting song file from storage")
	}

	err = p.playlistStorage.AddSong(ctx, req.PlaylistUuid, req.SongId)
	if err != nil {
		return rerrors.Wrap(err, "error adding song to playlist")
	}

	return nil
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
