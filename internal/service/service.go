package service

import (
	"context"
	"io"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/telegram"
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
	FeatureFlagsService() FeatureFlagsService
}

type service struct {
	audioService        AudioService
	userService         UserService
	authService         AuthService
	playlistService     PlaylistService
	artistsService      ArtistsService
	fileService         FileService
	featureFlagsService FeatureFlagsService
}

func New(dataStorage storage.Storage, cache files_cache.FilesCache, fileStorage storage.BinaryFileStorage) (Service, error) {
	tokenParser := telegram.NewTokenParser(
		"https://oauth.telegram.org/.well-known/jwks.json",
		"https://oauth.telegram.org",
		//TODO change to configurable bot id
		"8046808891")

	authSvc, err := auth.New(dataStorage, tokenParser)
	if err != nil {
		return nil, rerrors.Wrap(err, "error initializing auth service")
	}

	return &service{
		audioService:        v1.NewAudioService(dataStorage, cache, fileStorage),
		userService:         v1.NewUserService(dataStorage),
		authService:         authSvc,
		playlistService:     v1.NewPlaylistService(dataStorage, fileStorage),
		artistsService:      v1.NewArtistsService(dataStorage),
		fileService:         v1.NewFileService(dataStorage, fileStorage),
		featureFlagsService: v1.NewFeatureFlagsService(dataStorage),
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

func (s *service) FeatureFlagsService() FeatureFlagsService {
	return s.featureFlagsService
}

type AudioService interface {
	GetSong(ctx context.Context, songId int64) (domain.Song, error)

	GetInfo(ctx context.Context, fileId int64) (domain.Song, error)
	Save(ctx context.Context, req domain.AddAudio) (domain.SaveFileMetaResp, error)

	List(ctx context.Context, req domain.ListSongs) (domain.SongsList, error)
	Search(ctx context.Context, req domain.SearchSongsParams) ([]domain.Song, error)

	Get(fileId int64, start, end int64) (domain.Song, io.ReadCloser, error)

	Create(ctx context.Context, req domain.CreateSong) (int64, error)
	CreateBatch(ctx context.Context, req []domain.CreateSong) ([]int64, error)
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

	GetUserByToken(ctx context.Context, token string) (domain.User, error)
	Logout(ctx context.Context, accessToken string) error
	Refresh(ctx context.Context, refreshToken string) (domain.UserSession, error)
	ListAuthMethods(ctx context.Context) error

	// GetOrCreateTelegramUser finds or creates a user by telegram ID without JWT validation.
	// Used by the Telegram bot listener.
	GetOrCreateTelegramUser(ctx context.Context, tgId int64, username string) (internalUserId int64, err error)

	// ResolveTelegramId maps a Telegram ID to the internal users.id.
	ResolveTelegramId(ctx context.Context, tgId int64) (internalUserId int64, err error)
}

type PlaylistService interface {
	Create(ctx context.Context, req domain.CreatePlaylistParams) (string, error)
	Get(ctx context.Context, playlistUuid string) (domain.Playlist, error)
	Update(ctx context.Context, req domain.UpdatePlaylistParams) error
	ChangeSongsOrder(ctx context.Context, params domain.ChangeSongsOrderParams) error

	ListSongs(ctx context.Context, songs domain.ListSongs) (domain.SongsInPlaylist, error)
	AddSong(ctx context.Context, req domain.AddSongToPlaylist) error
	AddSongs(ctx context.Context, req domain.AddSongsToPlaylist) error
	List(ctx context.Context, req domain.ListPlaylists) (domain.ListPlaylistsResult, error)
}

type ArtistsService interface {
	List(ctx context.Context, req domain.ListArtists) ([]domain.ArtistsBase, error)
	Create(ctx context.Context, name string) (domain.ArtistsBase, error)
}

type FileService interface {
	SaveFile(ctx context.Context, fileNameWithExt string, content io.Reader) (int64, error)
	ListUploadedFiles(ctx context.Context, req domain.ListUploadedFiles) ([]domain.SongFile, error)
	GetFile(ctx context.Context, fileId int64) (domain.FileMeta, error)
	CheckFilesByHashes(ctx context.Context, hashes []string) ([]domain.FoundFileByHash, error)
}

type FeatureFlagsService interface {
	GetAll(ctx context.Context) ([]domain.FeatureFlag, error)
}
