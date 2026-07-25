package v1

import (
	"context"
	"database/sql"
	"fmt"
	"path"

	"github.com/rs/zerolog/log"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
)

// artistPageRowLimit caps each of the albums/singles/features rows returned
// by GetArtistPage - it's a single aggregating call with no pagination, per
// the "nothing fancy" scope of the artist page.
const artistPageRowLimit = 50

type ArtistsService struct {
	txManager *tx_manager.TxManager

	artistStorage   storage.ArtistStorage
	playlistStorage storage.PlaylistStorage
	songStorage     storage.SongStorage
	fileMetaStorage storage.FileMetaStorage
	binaryStorage   storage.BinaryFileStorage
	jobStorage      storage.JobStorage
}

func NewArtistsService(data storage.Storage, binaryStorage storage.BinaryFileStorage) *ArtistsService {
	return &ArtistsService{
		txManager: data.TxManager(),

		artistStorage:   data.ArtistStorage(),
		playlistStorage: data.PlaylistStorage(),
		songStorage:     data.SongsStorage(),
		fileMetaStorage: data.FileMeta(),
		binaryStorage:   binaryStorage,
		jobStorage:      data.Jobs(),
	}
}

func (s *ArtistsService) List(ctx context.Context, req domain.ListArtists) ([]domain.ArtistsBase, error) {
	artists, err := s.artistStorage.List(ctx, req)
	if err != nil {
		return nil, rerrors.Wrap(err, "error listing artists")
	}

	return artists, nil
}

func (s *ArtistsService) Create(ctx context.Context, name string) (domain.ArtistsBase, error) {
	artists, err := s.artistStorage.Return(ctx, []string{name})
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

	err := s.artistStorage.LikeArtist(ctx, userCtx.UserId, artistUuid)
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

	err := s.artistStorage.UnlikeArtist(ctx, userCtx.UserId, artistUuid)
	if err != nil {
		return rerrors.Wrap(err, "error unliking artist")
	}

	return nil
}

// GetArtistPage returns the artist header plus its albums/singles/features
// rows in one call, following HomeService.GetFeed's precedent of bundling
// several collections into a single screen fetch.
func (s *ArtistsService) GetArtistPage(ctx context.Context, artistUuid string) (domain.ArtistPage, error) {
	var userId int64
	var canEdit bool

	userCtx, ok := user_context.GetUserContext(ctx)
	if ok {
		userId = userCtx.UserId
		canEdit = userCtx.Permissions.CanEditArtists
	}

	artist, err := s.getArtist(ctx, artistUuid, userId, canEdit)
	if err != nil {
		return domain.ArtistPage{}, rerrors.Wrap(err, "error getting artist")
	}

	listAlbumsReq := domain.ListPlaylists{
		Limit: artistPageRowLimit,
		Filter: domain.PlaylistFilter{
			ArtistUuid: sql.Null[string]{V: artistUuid, Valid: true},
		},
	}

	albums, err := s.playlistStorage.List(ctx, listAlbumsReq)
	if err != nil {
		return domain.ArtistPage{}, rerrors.Wrap(err, "error listing artist albums")
	}

	listSinglesReq := domain.ListSongsByArtist{
		ArtistUuid:     artistUuid,
		Role:           domain.ArtistSongRolePrimary,
		StandaloneOnly: true,
		Limit:          artistPageRowLimit,
	}

	singles, err := s.songStorage.ListByArtist(ctx, listSinglesReq)
	if err != nil {
		return domain.ArtistPage{}, rerrors.Wrap(err, "error listing artist singles")
	}

	listFeaturesReq := domain.ListSongsByArtist{
		ArtistUuid: artistUuid,
		Role:       domain.ArtistSongRoleFeatured,
		Limit:      artistPageRowLimit,
	}

	features, err := s.songStorage.ListByArtist(ctx, listFeaturesReq)
	if err != nil {
		return domain.ArtistPage{}, rerrors.Wrap(err, "error listing artist features")
	}

	page := domain.ArtistPage{
		Artist:   artist,
		Albums:   albums,
		Singles:  singles,
		Features: features,
	}

	return page, nil
}

// Update edits an artist's name and/or avatar/background-cover images.
// Requires the caller to have the CanEditArtists permission.
func (s *ArtistsService) Update(ctx context.Context, req domain.UpdateArtistParams) (domain.UpdateArtistResult, error) {
	result := domain.UpdateArtistResult{}

	userCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return result, rerrors.Wrap(service_errors.ErrUnauthenticated)
	}

	if !userCtx.Permissions.CanEditArtists {
		return result, rerrors.Wrap(service_errors.ErrUnauthorized)
	}

	err := s.txManager.Execute(func(tx *sql.Tx) error {
		artistStorage := s.artistStorage.WithTx(tx)
		fileMetaStorage := s.fileMetaStorage.WithTx(tx)
		jobStorage := s.jobStorage.WithTx(tx)

		if req.Name != "" {
			updateErr := artistStorage.Update(ctx, req)
			if updateErr != nil {
				return rerrors.Wrap(updateErr, "error updating artist fields")
			}
		}

		if req.AvatarFileId != nil {
			avatarPath, moveErr := s.moveArtistImageFile(
				ctx, fileMetaStorage, jobStorage,
				req.Uuid, *req.AvatarFileId, "avatar",
				artistStorage.UpdateAvatarFileId)
			if moveErr != nil {
				return rerrors.Wrap(moveErr, "error handling avatar file")
			}
			result.AvatarFilePath = &avatarPath
		}

		if req.BackgroundCoverFileId != nil {
			backgroundPath, moveErr := s.moveArtistImageFile(
				ctx, fileMetaStorage, jobStorage,
				req.Uuid, *req.BackgroundCoverFileId, "background",
				artistStorage.UpdateBackgroundCoverFileId)
			if moveErr != nil {
				return rerrors.Wrap(moveErr, "error handling background cover file")
			}
			result.BackgroundCoverFilePath = &backgroundPath
		}

		return nil
	})
	if err != nil {
		return domain.UpdateArtistResult{}, rerrors.Wrap(err)
	}

	return result, nil
}

// getArtist reads the artist header from storage, resolves both image paths
// and sets CanEdit. It's a private helper so GetArtistPage and Update never
// need to call one another (no public-method-calling-public-method).
func (s *ArtistsService) getArtist(ctx context.Context, artistUuid string, userId int64, canEdit bool) (domain.Artist, error) {
	artist, err := s.artistStorage.Get(ctx, artistUuid, userId)
	if err != nil {
		return domain.Artist{}, rerrors.Wrap(err, "error reading artist from storage")
	}

	s.resolveArtistImagePaths(ctx, &artist)
	artist.CanEdit = canEdit

	return artist, nil
}

// resolveArtistImagePaths mirrors PlaylistService.resolveCoverPath for the
// artist's two image slots.
func (s *ArtistsService) resolveArtistImagePaths(ctx context.Context, artist *domain.Artist) {
	if artist.AvatarFileId != nil {
		meta, err := s.fileMetaStorage.Get(ctx, *artist.AvatarFileId)
		if err != nil {
			log.Warn().Err(err).Int64("avatar_file_id", *artist.AvatarFileId).Msg("failed to resolve artist avatar file path")
		} else {
			artist.AvatarFilePath = buildVersionedCoverPath(meta.FilePath, meta.ContentHash)
		}
	}

	if artist.BackgroundCoverFileId != nil {
		meta, err := s.fileMetaStorage.Get(ctx, *artist.BackgroundCoverFileId)
		if err != nil {
			log.Warn().Err(err).Int64("background_cover_file_id", *artist.BackgroundCoverFileId).
				Msg("failed to resolve artist background cover file path")
		} else {
			artist.BackgroundCoverFilePath = buildVersionedCoverPath(meta.FilePath, meta.ContentHash)
		}
	}
}

// moveArtistImageFile mirrors PlaylistService.moveCoverFile: it copies the
// uploaded file to its permanent artist-scoped path, updates the file meta,
// enqueues the old path for garbage collection, and persists the new file id
// via the given persist func (ArtistStorage.UpdateAvatarFileId or
// UpdateBackgroundCoverFileId), returning the resolved, cache-busted path.
func (s *ArtistsService) moveArtistImageFile(
	ctx context.Context,
	fileMetaStorage storage.FileMetaStorage,
	jobStorage storage.JobStorage,
	artistUuid string,
	fileId int64,
	fileName string,
	persist func(ctx context.Context, artistUuid string, fileId int64) error,
) (string, error) {
	meta, err := fileMetaStorage.Get(ctx, fileId)
	if err != nil {
		return "", rerrors.Wrap(err, "error getting artist image file meta")
	}

	if !meta.Verified {
		return "", rerrors.Wrap(service_errors.ErrFileNotVerified,
			"file you are trying to use as an artist image is not verified")
	}

	ext := path.Ext(meta.FilePath)
	newPath := fmt.Sprintf("%s/%s%s", artistUuid, fileName, ext)
	oldPath := meta.FilePath

	err = s.binaryStorage.Copy(ctx, oldPath, newPath)
	if err != nil {
		return "", rerrors.Wrap(err, "error copying artist image file")
	}

	meta.FilePath = newPath
	err = fileMetaStorage.Update(ctx, fileId, meta.File)
	if err != nil {
		return "", rerrors.Wrap(err, "error updating artist image file meta")
	}

	err = jobStorage.EnqueueGarbageFile(ctx, oldPath)
	if err != nil {
		return "", rerrors.Wrap(err, "error enqueueing old artist image file for deletion")
	}

	err = persist(ctx, artistUuid, fileId)
	if err != nil {
		return "", rerrors.Wrap(err, "error persisting artist image file id")
	}

	return buildVersionedCoverPath(newPath, meta.ContentHash), nil
}
