package service

import (
	"context"
	"io"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	v1 "go.zpotify.ru/zpotify/internal/service/v1"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/files_cache"
)

type Service interface {
	AudioService() AudioService
	UserService() UserService
	AuthService() AuthService
	PlaylistService() PlaylistService
	ArtistsService() ArtistsService
	FileService() FileService
}

type service struct {
	audioService    AudioService
	userService     UserService
	authService     AuthService
	playlistService PlaylistService
	artistsService  ArtistsService
	fileService     FileService
}

func New(dataStorage storage.Storage, cache files_cache.FilesCache, fileStorage storage.BinaryFileStorage) Service {
	return &service{
		audioService:    v1.NewAudioService(dataStorage, cache, fileStorage),
		userService:     v1.NewUserService(dataStorage),
		authService:     v1.NewAuthService(dataStorage),
		playlistService: v1.NewPlaylistService(dataStorage),
		artistsService:  v1.NewArtistsService(dataStorage),
		fileService:     v1.NewFileService(dataStorage, fileStorage),
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

func (s *service) PlaylistService() PlaylistService {
	return s.playlistService
}

func (s *service) ArtistsService() ArtistsService {
	return s.artistsService
}

func (s *service) FileService() FileService {
	return s.fileService
}

type AudioService interface {
	GetInfo(ctx context.Context, fileId int64) (domain.Song, error)
	Save(ctx context.Context, req domain.AddAudio) (domain.SaveFileMetaResp, error)

	List(ctx context.Context, req domain.ListSongs) (domain.SongsList, error)

	Get(fileId int64, start, end int64) (domain.Song, io.ReadCloser, error)

	Create(ctx context.Context, req domain.CreateSong) (int64, error)

	Delete(ctx context.Context, id int64) error
}

type UserService interface {
	Init(ctx context.Context, user domain.User) error
	Get(ctx context.Context, tgId int64) (domain.User, error)
	GetMe(ctx context.Context) (domain.User, error)
	GetByUsername(ctx context.Context, tgUsername string) (domain.User, error)
	GetSettings(ctx context.Context) (domain.UserSettings, error)
}

type AuthService interface {
	// Telegram auth old code
	//InitAuth() (authUuid string, doneC chan domain.UserSession)
	//AckAuth(ctx context.Context, authUuid string, tgId int64) error

	AuthWithToken(ctx context.Context, s string) (tgId int64, err error)
	Refresh(ctx context.Context, refreshToken string) (domain.UserSession, error)
	GetUserContext(ctx context.Context, tgUserId int64) (user_context.UserContext, error)

	ListAuthMethods(ctx context.Context) error

	AuthWithPassword(ctx context.Context, login string, password string) (domain.UserSession, error)
}

type PlaylistService interface {
	//Create(context.Context, domain.CreatePlaylistParams) (domain.Playlist, error)
	//Get(ctx context.Context, uuid string) (domain.Playlist, error)

	ListSongs(ctx context.Context, songs domain.ListSongs) (domain.SongsInPlaylist, error)
	AddSong(ctx context.Context, req domain.AddSongToPlaylist) error
}

type ArtistsService interface {
	List(ctx context.Context, req domain.ListArtists) ([]domain.ArtistsBase, error)
}

type FileService interface {
	SaveFile(ctx context.Context, fileNameWithExt string, content io.Reader) (int64, error)
	ListUploadedFiles(ctx context.Context, req domain.ListUploadedFiles) ([]domain.SongFile, error)
	GetFile(ctx context.Context, fileId int64) (domain.FileMeta, error)
}
