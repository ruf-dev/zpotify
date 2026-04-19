package v1

import (
	"context"
	"io"
	"strings"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/files_cache"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
)

type AudioService struct {
	txManager *tx_manager.TxManager

	fileMetaStorage storage.FileMetaStorage
	songsStorage    storage.SongStorage
	usersStorage    storage.UserStorage
	artistStorage   storage.ArtistStorage

	filesCache files_cache.FilesCache
}

func NewAudioService(
	dataStorage storage.Storage,

	filesCache files_cache.FilesCache,
) *AudioService {
	return &AudioService{
		txManager: dataStorage.TxManager(),

		songsStorage: dataStorage.SongsStorage(),
		usersStorage: dataStorage.User(),

		//fileMetaStorage: dataStorage.FileMeta(),
		//artistStorage:   dataStorage.ArtistStorage(),

		filesCache: filesCache,
	}
}

func (s *AudioService) Create(ctx context.Context, req domain.CreateSong) (int64, error) {
	id, err := s.songsStorage.Create(ctx, req.CreateSongParams)
	if err != nil {
		return 0, rerrors.Wrap(err, "error creating song in storage")
	}

	//Todo add artists

	return id, nil
}

func (s *AudioService) Delete(ctx context.Context, id int64) error {
	return nil
}

func (s *AudioService) Save(ctx context.Context, req domain.AddAudio) (out domain.SaveFileMetaResp, err error) {
	//filter := domain.GetUserFilter{
	//	TgUserId: []int64{req.AddedByTgId},
	//}

	//users, err := s.usersStorage.ListUsers(ctx, filter)
	//if err != nil {
	//	return out, rerrors.Wrap(err, "error getting user from storage")
	//}

	//if len(users) == 0 {
	//	return domain.SaveFileMetaResp{}, rerrors.Wrap(user_errors.ErrNotFound, "user not found")
	//}

	// TODO get user from context
	//if !users[0].Permissions.CanUpload {
	//	out.Code = domain.SaveFileCodeUserNotAllowed
	//	return out, nil
	//}

	//TODO replace
	//tgFile, err := s.tgApi.GetFile(ctx, req.TgFileId)
	//if err != nil {
	//	return out, rerrors.Wrap(err, "error getting file from Telegram")
	//}

	//meta := domain.FileMeta{
	//	File: domain.File{
	//		FilePath:  tgFile.FilePath,
	//		SizeBytes: int64(tgFile.FileSize),
	//	},
	//	AddedByTgId: req.AddedByTgId,
	//}

	//err = s.txManager.Execute(func(tx *sql.Tx) error {
	//	// TODO
	//	fileMetaStorage := s.fileMetaStorage.WithTx(tx)
	//	//artistStorage := s.artistStorage.WithTx(tx)
	//	songsStorage := s.songsStorage.WithTx(tx)
	//
	//	err = fileMetaStorage.Add(ctx, meta)
	//	if err != nil {
	//		switch {
	//		case rerrors.Is(err, storage.ErrAlreadyExists):
	//			out.Code = domain.SaveFileCodeAlreadyExists
	//			return err
	//		default:
	//			return rerrors.Wrap(err, "error saving meta to zpotify's storage")
	//		}
	//	}
	//
	//	//artistsNames := separateArtists(req.Author)
	//
	//	//var artists []domain.ArtistsBase
	//	//artists, err = artistStorage.Return(ctx, artistsNames)
	//	//if err != nil {
	//	//	return rerrors.Wrap(err, "error getting artists from storage")
	//	//}
	//
	//	song := domain.SongBase{
	//		Title: sanitizeTitle(req.Title),
	//		//TODO
	//		//Artists:  artists,
	//		//Duration: req.Duration,
	//	}
	//
	//	err = songsStorage.Save(ctx, song)
	//	if err != nil {
	//		return rerrors.Wrap(err, "error saving song")
	//	}
	//
	//	// TODO
	//	//err = songsStorage.SaveSongsArtists(ctx, song)
	//	//if err != nil {
	//	//	return rerrors.Wrap(err, "error saving songs artists")
	//	//}
	//
	//	err = songsStorage.AddSongsToPlaylist(ctx, GlobalPlaylistUuid, song.Id)
	//	if err != nil {
	//		return rerrors.Wrap(err, "error saving songs artists")
	//	}
	//
	//	out.Code = domain.SaveFileCodeOk
	//
	//	return nil
	//})
	//if err != nil {
	//	switch out.Code {
	//	case domain.SaveFileCodeAlreadyExists:
	//		return out, nil
	//	default:
	//		return out, rerrors.Wrap(err)
	//	}
	//}

	return out, nil
}

func (s *AudioService) Get(uniqueFileId int64, start, end int64) (domain.Song, io.ReadCloser, error) {
	//f, isNew := s.filesCache.GetOrCreate(uniqueFileId)
	//if !isNew {
	//	// On first call initializes self and continue to downloading file
	//	// every call after will fall into this case and wait for stream to start
	//	return f.SongInfo, f.Get(start, end), nil
	//}

	//ctx := context.Background()

	// Before uploading file to cache - validate it's size
	//fileMeta, err := s.fileMetaStorage.Get(ctx, uniqueFileId)
	//if err != nil {
	//	return f.SongInfo, nil, rerrors.Wrap(err, "error getting file meta from storage")
	//}

	//song, err := s.songsStorage.Get(ctx, uniqueFileId)
	//if err != nil {
	//	return f.SongInfo, nil, rerrors.Wrap(err, "error getting song from storage")
	//}

	//f.SongInfo.SongBase = song
	//f.SongInfo.FileMeta = fileMeta

	//telegramBytesStream, err := s.openFileWithFallback(ctx, fileMeta)
	//if err != nil {
	//	return f.SongInfo, nil, rerrors.Wrap(err, "error getting file from storage")
	//}

	//s.filesCache.Set(uniqueFileId, f)
	//
	//go func() {
	//	f.Upload(telegramBytesStream, fileMeta.SizeBytes)
	//}()

	//return f.SongInfo, f.Get(start, end), nil
	return domain.Song{}, nil, nil
}

func (s *AudioService) GetInfo(ctx context.Context, fileId int64) (domain.Song, error) {
	return domain.Song{}, nil
}

func (s *AudioService) List(ctx context.Context, req domain.ListSongs) (domain.SongsList, error) {
	return domain.SongsList{}, nil
}

func (s *AudioService) openFileWithFallback(ctx context.Context, file domain.FileMeta) (io.ReadCloser, error) {
	//telegramBytesStream, err := s.tgApi.OpenFile(ctx, file.TgFile)
	//if err == nil {
	//	return telegramBytesStream, nil
	//}
	//
	//if !rerrors.Is(err, service_errors.ErrNotFound) {
	//	return nil, rerrors.Wrap(err, "error opening file from Telegram to stream")
	//}
	//
	//// Fallback on not found
	//f, err := s.tgApi.GetFile(ctx, file.FileId)
	//if err != nil {
	//	return nil, rerrors.Wrap(err, "error getting file from telegram")
	//}
	//
	//file.FileId = f.FileID
	//file.FilePath = f.FilePath
	//file.SizeBytes = int64(f.FileSize)
	//
	//err = s.fileMetaStorage.Upsert(ctx, file)
	//if err != nil {
	//	return nil, rerrors.Wrap(err,
	//		"error upserting file to storage after failing to finding it in telegram cache")
	//}
	//
	//telegramBytesStream, err = s.tgApi.OpenFile(ctx, file.TgFile)
	//if err != nil {
	//	return nil, rerrors.Wrap(err, "error opening file from Telegram to stream")
	//}

	return nil, nil
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
