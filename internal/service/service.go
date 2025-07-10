package service

import (
	"context"

	"github.com/Red-Sock/go_tg"
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"

	"go.zpotify.ru/zpotify/internal/domain"
	v1 "go.zpotify.ru/zpotify/internal/service/v1"
	"go.zpotify.ru/zpotify/internal/storage"
)

type Service interface {
	FileService() AudioService
	UserService() UserService
}

type service struct {
	fileService AudioService
	userService UserService
}

func New(bot *go_tg.Bot, dataStorage storage.Storage) Service {
	return &service{
		fileService: v1.NewFileService(bot),
		userService: v1.NewUserService(dataStorage),
	}
}

func (s *service) FileService() AudioService {
	return s.fileService
}

func (s *service) UserService() UserService {
	return s.userService
}

type AudioService interface {
	GetInfo(ctx context.Context, uniqueFileId string) (*tgbotapi.File, error)
	//GetFile(ctx context.Context, fileId string) (io.ReadCloser, error)
}

type UserService interface {
	Init(ctx context.Context, user domain.User) error
}
