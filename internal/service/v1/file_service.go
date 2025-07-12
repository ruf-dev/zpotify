package v1

import (
	"context"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/telegram"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

type FileService struct {
	tgApi           telegram.TgApiClient
	fileMetaStorage storage.FileMetaStorage
	userStorage     storage.UserStorage
}

func NewFileService(tgApi telegram.TgApiClient, dataStorage storage.Storage) *FileService {
	return &FileService{
		tgApi:           tgApi,
		fileMetaStorage: dataStorage.FileMeta(),
		userStorage:     dataStorage.User(),
	}
}

func (s *FileService) Save(ctx context.Context, meta domain.FileMeta) (out domain.SaveFileMetaResp, err error) {
	user, err := s.userStorage.GetUser(ctx, meta.AddedByTgId)
	if err != nil {
		return out, rerrors.Wrap(err, "error getting user from storage")
	}

	if !user.Permissions.CanUpload {
		out.Code = domain.SaveFileCodeUserNotAllowed
		return out, nil
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

func (s *FileService) GetInfo(ctx context.Context, uniqueFileId string) (*tgbotapi.File, error) {
	f, err := s.tgApi.GetFile(ctx, uniqueFileId)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return f, nil
}
