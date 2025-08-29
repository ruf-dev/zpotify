package service

import (
	"context"
	"io"

	"go.zpotify.ru/zpotify/internal/clients/telegram"
	"go.zpotify.ru/zpotify/internal/domain"
	v1 "go.zpotify.ru/zpotify/internal/service/v1"
	"go.zpotify.ru/zpotify/internal/storage"
)

type Service interface {
	AudioService() AudioService
	UserService() UserService
	AuthService() AuthService
}

type service struct {
	audioService AudioService
	userService  UserService
	authService  AuthService
}

func New(tgApiClient telegram.TgApiClient, dataStorage storage.Storage) Service {
	return &service{
		audioService: v1.NewAudioService(tgApiClient, dataStorage),
		userService:  v1.NewUserService(dataStorage),
		authService:  v1.NewAuthService(dataStorage),
	}
}

func (s *service) AudioService() AudioService {
	return s.audioService
}

func (s *service) UserService() UserService {
	return s.userService
}

func (s *service) AuthService() AuthService {
	return s.authService
}

type AudioService interface {
	GetInfo(ctx context.Context, uniqueFileId string) (domain.FileMeta, error)
	Save(ctx context.Context, req domain.AddAudio) (domain.SaveFileMetaResp, error)

	List(ctx context.Context, req domain.ListSongs) (domain.SongsList, error)

	Stream(ctx context.Context, uniqueFileId string) (io.Reader, error)
}

type UserService interface {
	Init(ctx context.Context, user domain.User) error
	Get(ctx context.Context, tgId int64) (domain.User, error)
	GetByUsername(ctx context.Context, tgUsername string) (domain.User, error)
}

type AuthService interface {
	InitAuth() (authUuid string, doneC chan domain.UserSession)
	AckAuth(ctx context.Context, authUuid string, tgId int64) error
	AuthWithToken(ctx context.Context, s string) (tgId int64, err error)
	Refresh(ctx context.Context, refreshToken string) (domain.UserSession, error)
}
