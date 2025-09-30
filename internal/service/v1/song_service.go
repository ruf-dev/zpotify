package v1

import (
	"context"
	"database/sql"
	"io"
	"strings"

	"github.com/rs/zerolog/log"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/telegram"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/files_cache"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
)

type AudioService struct {
	tgApi telegram.TgApiClient

	txManager *tx_manager.TxManager

	fileMetaStorage storage.FileMetaStorage
	songsStorage    storage.SongStorage
	usersStorage    storage.UserStorage
	artistStorage   storage.ArtistStorage

	filesCache files_cache.FilesCache
}

func NewAudioService(
	tgApi telegram.TgApiClient,
	dataStorage storage.Storage,

	filesCache files_cache.FilesCache,
) *AudioService {
	return &AudioService{
		tgApi:     tgApi,
		txManager: dataStorage.TxManager(),

		fileMetaStorage: dataStorage.FileMeta(),
		songsStorage:    dataStorage.SongStorage(),
		usersStorage:    dataStorage.User(),
		artistStorage:   dataStorage.ArtistStorage(),

		filesCache: filesCache,
	}
}

func (s *AudioService) Save(ctx context.Context, req domain.AddAudio) (out domain.SaveFileMetaResp, err error) {
	user, err := s.usersStorage.GetUser(ctx, req.AddedByTgId)
	if err != nil {
		return out, rerrors.Wrap(err, "error getting user from storage")
	}

	if !user.Permissions.CanUpload {
		out.Code = domain.SaveFileCodeUserNotAllowed
		return out, nil
	}

	tgFile, err := s.tgApi.GetFile(ctx, req.TgFileId)
	if err != nil {
		return out, rerrors.Wrap(err, "error getting file from Telegram")
	}

	meta := domain.FileMeta{
		TgFile: domain.TgFile{
			UniqueFileId: tgFile.FileUniqueID,
			FileId:       tgFile.FileID,
			FilePath:     tgFile.FilePath,
			SizeBytes:    int64(tgFile.FileSize),
		},
		AddedByTgId: req.AddedByTgId,
	}

	err = s.txManager.Execute(func(tx *sql.Tx) error {
		fileMetaStorage := s.fileMetaStorage.WithTx(tx)
		artistStorage := s.artistStorage.WithTx(tx)
		songsStorage := s.songsStorage.WithTx(tx)

		err = fileMetaStorage.Add(ctx, meta)
		if err != nil {
			switch {
			case rerrors.Is(err, storage.ErrAlreadyExists):
				out.Code = domain.SaveFileCodeAlreadyExists
				return nil
			default:
				return rerrors.Wrap(err, "error saving meta to zpotify's storage")
			}
		}

		artistsNames := separateArtists(req.Author)

		var artists []domain.ArtistsBase
		artists, err = artistStorage.Return(ctx, artistsNames)
		if err != nil {
			return rerrors.Wrap(err, "error getting artists from storage")
		}

		song := domain.SongBase{
			UniqueFileId: meta.UniqueFileId,
			Title:        sanitizeTitle(req.Title),
			Artists:      artists,
			Duration:     req.Duration,
		}

		err = songsStorage.Save(ctx, song)
		if err != nil {
			return rerrors.Wrap(err, "error saving song")
		}

		out.Code = domain.SaveFileCodeOk

		return nil
	})
	if err != nil {
		return out, rerrors.Wrap(err)
	}

	return out, nil
}

func (s *AudioService) Get(ctx context.Context, uniqueFileId string, start, end int64) (io.ReadCloser, error) {
	fileMeta, err := s.fileMetaStorage.Get(ctx, uniqueFileId)
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting file meta from storage")
	}

	f := s.filesCache.GetOrCreateDummy(uniqueFileId)
	if f.IsInitializedSwap() {
		// On first call initializes self and continue to downloading file
		// every call after will fall into this case and wait for stream to start
		return f.Get(start, end), nil
	}

	telegramBytesStream, err := s.openFileWithFallback(ctx, fileMeta)
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting file from storage")
	}

	s.filesCache.Set(uniqueFileId, f)

	go func() {
		f.Upload(telegramBytesStream, fileMeta.SizeBytes)

		if f.Size() != fileMeta.SizeBytes {
			fileMeta.SizeBytes = f.Size()
			err := s.fileMetaStorage.Upsert(ctx, fileMeta)
			if err != nil {
				log.Err(err).
					Msg("error updating file meta for miss matched file size")
			}
		}
	}()

	return f.Get(start, end), nil
}

func (s *AudioService) GetInfo(ctx context.Context, uniqueFileId string) (domain.Song, error) {
	fileMeta, err := s.fileMetaStorage.Get(ctx, uniqueFileId)
	if err != nil {
		return domain.Song{}, rerrors.Wrap(err, "error getting file from storage")
	}

	songBase, err := s.songsStorage.Get(ctx, uniqueFileId)
	if err != nil {
		return domain.Song{}, rerrors.Wrap(err, "error getting songBase from storage")
	}

	return domain.Song{
		SongBase: songBase,
		FileMeta: fileMeta,
	}, nil
}

func (s *AudioService) List(ctx context.Context, req domain.ListSongs) (domain.SongsList, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	list, err := s.songsStorage.List(ctx, req)
	if err != nil {
		return domain.SongsList{}, rerrors.Wrap(err, "error listing songs")
	}

	total, err := s.songsStorage.Count(ctx, req)
	if err != nil {
		return domain.SongsList{}, rerrors.Wrap(err, "error counting songs")
	}

	return domain.SongsList{
		Songs: list,
		Total: total,
	}, nil
}

func (s *AudioService) openFileWithFallback(ctx context.Context, file domain.FileMeta) (io.ReadCloser, error) {
	telegramBytesStream, err := s.tgApi.OpenFile(ctx, file.TgFile)
	if err == nil {
		return telegramBytesStream, nil
	}

	if !rerrors.Is(err, service_errors.ErrNotFound) {
		return nil, rerrors.Wrap(err, "error opening file from Telegram to stream")
	}

	// Fallback on not found
	f, err := s.tgApi.GetFile(ctx, file.FileId)
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting file from telegram")
	}

	file.FileId = f.FileID
	file.FilePath = f.FilePath
	file.SizeBytes = int64(f.FileSize)

	err = s.fileMetaStorage.Upsert(ctx, file)
	if err != nil {
		return nil, rerrors.Wrap(err,
			"error upserting file to storage after failing to finding it in telegram cache")
	}

	telegramBytesStream, err = s.tgApi.OpenFile(ctx, file.TgFile)
	if err != nil {
		return nil, rerrors.Wrap(err, "error opening file from Telegram to stream")
	}

	return telegramBytesStream, nil
}

func separateArtists(artists string) []string {
	comaSeparated := strings.Split(artists, ",")

	for idx := range comaSeparated {
		comaSeparated[idx] = strings.TrimSpace(comaSeparated[idx])
		comaSeparated[idx] = sanitizeTitle(comaSeparated[idx])
	}

	return comaSeparated
}

var replacer = strings.NewReplacer(
	"&#39;", "'",
)

func sanitizeTitle(title string) string {
	return replacer.Replace(title)
}
