package service

import (
	"context"
	"io"

	"go.zpotify.ru/zpotify/internal/domain"
	v1 "go.zpotify.ru/zpotify/internal/service/v1"
	"go.zpotify.ru/zpotify/internal/service/v1/auth"
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

func New(dataStorage storage.Storage, cache files_cache.FilesCache, fileStorage storage.BinaryFileStorage) (Service, error) {
	authSvc, err := auth.New(dataStorage)
	if err != nil {
		return nil, err
	}

	return &service{
		audioService:    v1.NewAudioService(dataStorage, cache, fileStorage),
		userService:     v1.NewUserService(dataStorage),
		authService:     authSvc,
		playlistService: v1.NewPlaylistService(dataStorage),
		artistsService:  v1.NewArtistsService(dataStorage),
		fileService:     v1.NewFileService(dataStorage, fileStorage),
	}, nil
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
	GetSong(ctx context.Context, songId int64) (domain.Song, error)

	GetInfo(ctx context.Context, fileId int64) (domain.Song, error)
	Save(ctx context.Context, req domain.AddAudio) (domain.SaveFileMetaResp, error)

	List(ctx context.Context, req domain.ListSongs) (domain.SongsList, error)

	Get(fileId int64, start, end int64) (domain.Song, io.ReadCloser, error)

	Create(ctx context.Context, req domain.CreateSong) (int64, error)
	Update(ctx context.Context, req domain.UpdateSong) error

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
	Login(ctx context.Context, login string, password string) (domain.UserSession, error)
	LoginViaTelegram(ctx context.Context, idToken string) (domain.UserSession, error)
	ValidateToken(ctx context.Context, token string) (userId int64, err error)
	Logout(ctx context.Context, accessToken string) error
	Refresh(ctx context.Context, refreshToken string) (domain.UserSession, error)
	GetMe(ctx context.Context, userId int64) (domain.User, domain.UserPermissions, error)
	ListAuthMethods(ctx context.Context) error

	// GetOrCreateTelegramUser finds or creates a user by telegram ID without JWT validation.
	// Used by the Telegram bot listener.
	GetOrCreateTelegramUser(ctx context.Context, tgId int64, username string) (internalUserId int64, err error)

	// ResolveTelegramId maps a Telegram ID to the internal users.id.
	ResolveTelegramId(ctx context.Context, tgId int64) (internalUserId int64, err error)
}

type PlaylistService interface {
	//Create(context.Context, domain.CreatePlaylistParams) (domain.Playlist, error)

	Get(ctx context.Context, playlistUuid string) (domain.Playlist, error)

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
