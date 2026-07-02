package v1

import (
	"context"
	"database/sql"
	"fmt"
	"path"

	"github.com/rs/zerolog/log"
	"go.redsock.ru/rerrors"
	"go.redsock.ru/toolbox"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
)

type PlaylistService struct {
	txManager *tx_manager.TxManager

	playlistStorage storage.PlaylistStorage
	userStorage     storage.UserStorage
	fileMetaStorage storage.FileMetaStorage
	binaryStorage   storage.BinaryFileStorage
	jobStorage      storage.JobStorage
}

func NewPlaylistService(data storage.Storage, binaryStorage storage.BinaryFileStorage) *PlaylistService {
	return &PlaylistService{
		txManager: data.TxManager(),

		playlistStorage: data.PlaylistStorage(),
		userStorage:     data.User(),
		fileMetaStorage: data.FileMeta(),
		binaryStorage:   binaryStorage,
		jobStorage:      data.Jobs(),
	}
}

func (p *PlaylistService) Create(ctx context.Context, req domain.CreatePlaylistParams) (string, error) {
	userCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return "", rerrors.Wrap(service_errors.ErrUnauthenticated)
	}

	if !userCtx.Permissions.CanCreatePlaylist {
		return "", rerrors.Wrap(service_errors.ErrUnauthorized)
	}

	var playlistUuid string

	err := p.txManager.Execute(
		func(tx *sql.Tx) error {
			playlistStorage := p.playlistStorage.WithTx(tx)
			fileMetaStorage := p.fileMetaStorage.WithTx(tx)

			var createErr error
			playlistUuid, createErr = playlistStorage.Create(ctx, req, userCtx.UserId)
			if createErr != nil {
				return rerrors.Wrap(createErr, "error creating playlist in storage")
			}

			for i, artistUuid := range req.ArtistUuids {
				//TODO make bath insert of artists into playlist
				createErr = playlistStorage.AddPlaylistArtist(ctx, playlistUuid, artistUuid, i)
				if createErr != nil {
					return rerrors.Wrap(createErr, "error adding artist to playlist")
				}
			}

			for i, chip := range req.Chips {
				createErr = playlistStorage.InsertPlaylistChip(ctx, playlistUuid, chip, i)
				if createErr != nil {
					return rerrors.Wrap(createErr, "error adding chip to playlist")
				}
			}

			if req.CoverFileId != nil {
				jobStorage := p.jobStorage.WithTx(tx)
				_, createErr = p.moveCoverFile(ctx, fileMetaStorage, playlistStorage, jobStorage, playlistUuid, *req.CoverFileId, req.ArtistUuids, userCtx.UserId)
				if createErr != nil {
					return rerrors.Wrap(createErr, "error handling cover file")
				}
			}

			return nil
		})
	if err != nil {
		return "", err
	}

	return playlistUuid, nil
}

func (p *PlaylistService) Get(ctx context.Context, playlistUuid string) (domain.Playlist, error) {
	userCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return domain.Playlist{}, rerrors.Wrap(service_errors.ErrUnauthenticated)
	}

	playlist, err := p.playlistStorage.Get(ctx, userCtx.UserId, playlistUuid)
	if err != nil {
		return domain.Playlist{}, rerrors.Wrap(err, "error reading playlist info")
	}

	p.resolveCoverPath(ctx, &playlist)

	chips, err := p.playlistStorage.GetPlaylistChips(ctx, playlistUuid)
	if err != nil {
		return domain.Playlist{}, rerrors.Wrap(err, "error reading playlist chips")
	}
	playlist.Chips = chips

	permissions, err := p.userStorage.GetPermissionsOnPlaylist(ctx, userCtx.UserId, playlistUuid)
	if err != nil {
		return domain.Playlist{}, rerrors.Wrap(err, "error reading playlist permissions")
	}
	playlist.Permissions = &permissions

	return playlist, nil
}

func (p *PlaylistService) Update(ctx context.Context, req domain.UpdatePlaylistParams) (domain.UpdatePlaylistResult, error) {
	result := domain.UpdatePlaylistResult{}

	userCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return result, rerrors.Wrap(service_errors.ErrUnauthenticated)
	}

	permissions, err := p.userStorage.GetPermissionsOnPlaylist(ctx, userCtx.UserId, req.Uuid)
	if err != nil {
		return result, rerrors.Wrap(err, "error getting permissions on playlist")
	}

	if !permissions.CanDeleteSongs {
		return result, rerrors.Wrap(service_errors.ErrUnauthorized)
	}

	err = p.txManager.Execute(func(tx *sql.Tx) error {
		playlistStorage := p.playlistStorage.WithTx(tx)
		fileMetaStorage := p.fileMetaStorage.WithTx(tx)

		if req.Name != "" || req.Description != "" || req.IsPublic != nil {
			updateErr := playlistStorage.Update(ctx, req)
			if updateErr != nil {
				return rerrors.Wrap(updateErr, "error updating playlist fields")
			}
		}

		if req.ArtistUuids != nil {
			clearErr := playlistStorage.ClearPlaylistArtists(ctx, req.Uuid)
			if clearErr != nil {
				return rerrors.Wrap(clearErr, "error clearing playlist artists")
			}

			for i, artistUuid := range req.ArtistUuids {
				addErr := playlistStorage.AddPlaylistArtist(ctx, req.Uuid, artistUuid, i)
				if addErr != nil {
					return rerrors.Wrap(addErr, "error adding artist to playlist")
				}
			}
		}

		if req.Chips != nil {
			clearErr := playlistStorage.ClearPlaylistChips(ctx, req.Uuid)
			if clearErr != nil {
				return rerrors.Wrap(clearErr, "error clearing playlist chips")
			}

			for i, chip := range req.Chips {
				addErr := playlistStorage.InsertPlaylistChip(ctx, req.Uuid, chip, i)
				if addErr != nil {
					return rerrors.Wrap(addErr, "error adding chip to playlist")
				}
			}
		}

		if req.CoverFileId != nil {
			updatedArtists := req.ArtistUuids
			if updatedArtists == nil {
				artists, artistsErr := playlistStorage.GetPlaylistArtists(ctx, req.Uuid)
				if artistsErr != nil {
					return rerrors.Wrap(artistsErr, "error getting playlist artists for cover placement")
				}
				updatedArtists = make([]string, len(artists))
				for i, a := range artists {
					updatedArtists[i] = a.Uuid
				}
			}

			jobStorage := p.jobStorage.WithTx(tx)
			coverFilePath, coverErr := p.moveCoverFile(ctx, fileMetaStorage, playlistStorage, jobStorage, req.Uuid, *req.CoverFileId, updatedArtists, userCtx.UserId)
			if coverErr != nil {
				return rerrors.Wrap(coverErr, "error handling cover file")
			}
			result.CoverFilePath = &coverFilePath
		}

		return nil
	})
	if err != nil {
		return domain.UpdatePlaylistResult{}, rerrors.Wrap(err)
	}

	return result, nil
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
		return rerrors.Wrap(service_errors.ErrUnauthorized, "user is missing can_add_song permission on playlist")
	}

	songFile, err := p.fileMetaStorage.GetBySongId(ctx, req.SongId)
	if err != nil {
		return rerrors.Wrap(err, "error getting song file from storage")
	}

	if !songFile.Verified {
		return rerrors.Wrap(service_errors.ErrFileNotVerified,
			"file you are trying to add as a song to playlist is not verified")
	}

	err = p.playlistStorage.AddSong(ctx, req.PlaylistUuid, req.SongId)
	if err != nil {
		return rerrors.Wrap(err, "error saving song to playlist")
	}

	return nil
}

func (p *PlaylistService) AddSongs(ctx context.Context, req domain.AddSongsToPlaylist) error {
	userCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return rerrors.Wrap(service_errors.ErrUnauthenticated)
	}

	permissions, err := p.userStorage.GetPermissionsOnPlaylist(ctx, userCtx.UserId, req.PlaylistUuid)
	if err != nil {
		return rerrors.Wrap(err, "error getting permissions for playlist")
	}

	if !permissions.CanAddSongs {
		return rerrors.Wrap(service_errors.ErrUnauthorized, "user is missing can_add_song permission on playlist")
	}

	for _, songId := range req.SongIds {
		songFile, err := p.fileMetaStorage.GetBySongId(ctx, songId)
		if err != nil {
			return rerrors.Wrap(err, "error getting song file from storage")
		}

		if !songFile.Verified {
			return rerrors.Wrap(service_errors.ErrFileNotVerified,
				"file you are trying to add as a song to playlist is not verified")
		}
	}

	err = p.txManager.Execute(func(tx *sql.Tx) error {
		playlistStorage := p.playlistStorage.WithTx(tx)

		for _, songId := range req.SongIds {
			err := playlistStorage.AddSong(ctx, req.PlaylistUuid, songId)
			if err != nil {
				return rerrors.Wrap(err, "error saving song to playlist")
			}
		}

		return nil
	})
	if err != nil {
		return rerrors.Wrap(err)
	}

	return nil
}

func (p *PlaylistService) ChangeSongsOrder(ctx context.Context, params domain.ChangeSongsOrderParams) error {
	userCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return rerrors.Wrap(service_errors.ErrUnauthenticated)
	}

	permissions, err := p.userStorage.GetPermissionsOnPlaylist(ctx, userCtx.UserId, params.PlaylistUuid)
	if err != nil {
		return rerrors.Wrap(err, "error getting permissions on playlist")
	}

	if !permissions.CanEdit {
		return rerrors.Wrap(service_errors.ErrUnauthorized)
	}

	err = p.txManager.Execute(func(tx *sql.Tx) error {
		playlistStorage := p.playlistStorage.WithTx(tx)
		for i, songId := range params.SongIds {
			setErr := playlistStorage.SetSongOrder(ctx, params.PlaylistUuid, songId, int64(i))
			if setErr != nil {
				return rerrors.Wrap(setErr, fmt.Sprintf("error setting order for song %d", songId))
			}
		}
		return nil
	})

	return err
}

func (p *PlaylistService) List(ctx context.Context, req domain.ListPlaylists) (domain.ListPlaylistsResult, error) {
	userCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return domain.ListPlaylistsResult{}, rerrors.Wrap(service_errors.ErrUnauthenticated)
	}

	req.Filter.UserId = sql.Null[int64]{V: userCtx.UserId, Valid: true}

	playlists, err := p.playlistStorage.List(ctx, req)
	if err != nil {
		return domain.ListPlaylistsResult{}, rerrors.Wrap(err, "error listing playlists from storage")
	}

	total, err := p.playlistStorage.CountPlaylists(ctx, req)
	if err != nil {
		return domain.ListPlaylistsResult{}, rerrors.Wrap(err, "error counting playlists from storage")
	}

	for i := range playlists {
		p.resolveCoverPath(ctx, &playlists[i])
	}

	result := domain.ListPlaylistsResult{
		Playlists: playlists,
		Total:     total,
	}

	return result, nil
}

func (p *PlaylistService) resolveCoverPath(ctx context.Context, pl *domain.Playlist) {
	if pl.CoverFileId == nil {
		return
	}

	meta, err := p.fileMetaStorage.Get(ctx, *pl.CoverFileId)
	if err != nil {
		log.Warn().Err(err).Int64("cover_file_id", *pl.CoverFileId).Msg("failed to resolve cover file path")
		return
	}

	pl.CoverFilePath = buildVersionedCoverPath(meta.FilePath, meta.ContentHash)
}

func (p *PlaylistService) moveCoverFile(
	ctx context.Context,
	fileMetaStorage storage.FileMetaStorage,
	playlistStorage storage.PlaylistStorage,
	jobStorage storage.JobStorage,
	playlistUuid string,
	coverFileId int64,
	artistUuids []string,
	userId int64,
) (string, error) {
	coverMeta, err := fileMetaStorage.Get(ctx, coverFileId)
	if err != nil {
		return "", rerrors.Wrap(err, "error getting cover file meta")
	}

	if !coverMeta.Verified {
		return "", rerrors.Wrap(service_errors.ErrFileNotVerified,
			"file you are trying to use as a playlist cover is not verified")
	}

	ext := path.Ext(coverMeta.FilePath)
	var newPath string
	if len(artistUuids) > 0 {
		newPath = fmt.Sprintf("%s/%s/cover%s", artistUuids[0], playlistUuid, ext)
	} else {
		//should use playlist uuid for this
		newPath = fmt.Sprintf("%d/%s/cover%s", userId, playlistUuid, ext)
	}

	oldPath := coverMeta.FilePath

	err = p.binaryStorage.Copy(ctx, oldPath, newPath)
	if err != nil {
		return "", rerrors.Wrap(err, "error copying cover file")
	}

	coverMeta.FilePath = newPath
	err = fileMetaStorage.Update(ctx, coverFileId, coverMeta.File)
	if err != nil {
		return "", rerrors.Wrap(err, "error updating cover file meta")
	}

	err = jobStorage.EnqueueGarbageFile(ctx, oldPath)
	if err != nil {
		return "", rerrors.Wrap(err, "error enqueueing old cover file for deletion")
	}

	err = playlistStorage.UpdateCoverFileId(ctx, playlistUuid, coverFileId)
	if err != nil {
		return "", rerrors.Wrap(err, "error updating playlist cover file id")
	}

	return buildVersionedCoverPath(newPath, coverMeta.ContentHash), nil
}

// buildVersionedCoverPath appends a content-hash-derived query param to a
// cover file path so that clients bust their image cache whenever the
// underlying cover content changes, even though the stored path itself is
// stable across re-uploads.
func buildVersionedCoverPath(filePath, contentHash string) string {
	if contentHash == "" {
		return filePath
	}

	hashLen := 12
	if len(contentHash) < hashLen {
		hashLen = len(contentHash)
	}

	return filePath + "?v=" + contentHash[:hashLen]
}
