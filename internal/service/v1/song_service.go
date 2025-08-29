package v1

import (
	"context"
	"io"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/telegram"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

type AudioService struct {
	tgApi           telegram.TgApiClient
	fileMetaStorage storage.FileMetaStorage
	userStorage     storage.UserStorage
	songStorage     storage.SongStorage
}

func NewAudioService(tgApi telegram.TgApiClient, dataStorage storage.Storage) *AudioService {
	return &AudioService{
		tgApi:           tgApi,
		fileMetaStorage: dataStorage.FileMeta(),
		userStorage:     dataStorage.User(),
		songStorage:     dataStorage.SongStorage(),
	}

}

func (s *AudioService) Save(ctx context.Context, req domain.AddAudio) (out domain.SaveFileMetaResp, err error) {
	user, err := s.userStorage.GetUser(ctx, req.AddedByTgId)
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
		},
		AddedByTgId: req.AddedByTgId,
		Title:       req.Title,
		Author:      req.Author,
	}

	err = s.fileMetaStorage.Add(ctx, meta)
	if err == nil {
		out.Code = domain.SaveFileCodeOk
		return out, nil
	}

	switch {
	case rerrors.Is(err, storage.ErrAlreadyExists):
		out.Code = domain.SaveFileCodeAlreadyExists
		return out, nil
	default:
		return out, rerrors.Wrap(err, "error saving meta to zpotify's storage")
	}
}

func (s *AudioService) Stream(ctx context.Context, uniqueFileId string) (io.Reader, error) {
	file, err := s.fileMetaStorage.Get(ctx, uniqueFileId)
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting file from storage")
	}

	f, err := s.tgApi.OpenFile(ctx, file.TgFile)
	if err != nil {
		return nil, rerrors.Wrap(err, "error opening file from Telegram to stream")
	}

	return f, nil
}

func (s *AudioService) GetInfo(ctx context.Context, uniqueFileId string) (domain.FileMeta, error) {
	fileMeta, err := s.fileMetaStorage.Get(ctx, uniqueFileId)
	if err != nil {
		return domain.FileMeta{}, rerrors.Wrap(err, "error getting file from storage")
	}

	return fileMeta, nil
}

func (s *AudioService) List(ctx context.Context, req domain.ListSongs) (domain.SongsList, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	list, err := s.songStorage.List(ctx, req)
	if err != nil {
		return domain.SongsList{}, rerrors.Wrap(err, "error listing songs")
	}

	total, err := s.songStorage.Count(ctx, req)
	if err != nil {
		return domain.SongsList{}, rerrors.Wrap(err, "error counting songs")
	}

	return domain.SongsList{
		Songs: list,
		Total: total,
	}, nil
}
