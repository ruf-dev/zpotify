package service

import (
	"context"

	"github.com/Red-Sock/go_tg"
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"

	v1 "go.zpotify.ru/zpotify/internal/service/v1"
)

type Service struct {
	fileService FileService
}

func New(bot *go_tg.Bot) *Service {
	return &Service{
		fileService: v1.NewFileService(bot),
	}
}

func (s *Service) FileService() FileService {
	return s.fileService
}

type FileService interface {
	GetInfo(ctx context.Context, uniqueFileId string) (*tgbotapi.File, error)
}
