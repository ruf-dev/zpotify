package service

import (
	"context"
	"io"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"

	"go.zpotify.ru/zpotify/internal/clients/telegram"
	"go.zpotify.ru/zpotify/internal/domain"
	v1 "go.zpotify.ru/zpotify/internal/service/v1"
	"go.zpotify.ru/zpotify/internal/storage"
)

type Service interface {
	AudioService() AudioService
	UserService() UserService
}

type service struct {
	fileService AudioService
	userService UserService
}

func New(tgApiClient telegram.TgApiClient, dataStorage storage.Storage) Service {
	return &service{
		fileService: v1.NewFileService(tgApiClient, dataStorage),
		userService: v1.NewUserService(dataStorage),
	}
}

func (s *service) AudioService() AudioService {
	return s.fileService
}

func (s *service) UserService() UserService {
	return s.userService
}

type AudioService interface {
	GetInfo(ctx context.Context, uniqueFileId string) (*tgbotapi.File, error)
	Save(ctx context.Context, req domain.FileMeta) (domain.SaveFileMetaResp, error)

	Stream(ctx context.Context, uniqueFileId string) (io.Reader, error)
}

type UserService interface {
	Init(ctx context.Context, user domain.User) error
	Get(ctx context.Context, tgId int64) (domain.User, error)
}
