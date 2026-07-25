package service

import (
	"context"
	"io"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/telegram"
	"go.zpotify.ru/zpotify/internal/config"
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
	HomeService() HomeService
	NotificationService() NotificationService
}

type service struct {
	audioService        AudioService
	userService         UserService
	authService         AuthService
	playlistService     PlaylistService
	artistsService      ArtistsService
	fileService         FileService
	featureFlagsService FeatureFlagsService
	homeService         HomeService
	notificationService NotificationService
}

func New(dataStorage storage.Storage, cache files_cache.FilesCache,
	fileStorage storage.BinaryFileStorage, adminNotifier auth.AdminNotifier,
	cfg config.Config,
) (Service, error) {
	tokenParser := telegram.NewTokenParser(
		"https://oauth.telegram.org/.well-known/jwks.json",
		"https://oauth.telegram.org",
		cfg.Environment.TelegramClientID)

	authSvc, err := auth.New(dataStorage, tokenParser, adminNotifier)
	if err != nil {
		return nil, rerrors.Wrap(err, "error initializing auth service")
	}

	return &service{
		audioService:        v1.NewAudioService(dataStorage, cache, fileStorage),
		userService:         v1.NewUserService(dataStorage),
		authService:         authSvc,
		playlistService:     v1.NewPlaylistService(dataStorage, fileStorage),
		artistsService:      v1.NewArtistsService(dataStorage, fileStorage),
		fileService:         v1.NewFileService(dataStorage, fileStorage),
		featureFlagsService: v1.NewFeatureFlagsService(dataStorage),
		homeService:         v1.NewHomeService(dataStorage),
		notificationService: v1.NewNotificationService(dataStorage),
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

func (s *service) HomeService() HomeService {
	return s.homeService
}

func (s *service) NotificationService() NotificationService {
	return s.notificationService
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

	// GrantAccess enables listener-only access (early access) for a user.
	GrantAccess(ctx context.Context, userId int64) error

	// GrantCreatorAccess enables creator permissions (upload, playlists, early access)
	// plus default upload size limits for a user.
	GrantCreatorAccess(ctx context.Context, userId int64) error
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
	Update(ctx context.Context, req domain.UpdatePlaylistParams) (domain.UpdatePlaylistResult, error)
	ChangeSongsOrder(ctx context.Context, params domain.ChangeSongsOrderParams) error

	ListSongs(ctx context.Context, songs domain.ListSongs) (domain.SongsInPlaylist, error)
	AddSong(ctx context.Context, req domain.AddSongToPlaylist) error
	AddSongs(ctx context.Context, req domain.AddSongsToPlaylist) error
	DeleteSong(ctx context.Context, req domain.DeleteSongFromPlaylist) error
	List(ctx context.Context, req domain.ListPlaylists) (domain.ListPlaylistsResult, error)

	// Follow adds a public playlist that isn't owned by the caller to their library.
	Follow(ctx context.Context, playlistUuid string) error
	// Unfollow removes a previously followed playlist from the caller's library.
	Unfollow(ctx context.Context, playlistUuid string) error
}

type ArtistsService interface {
	List(ctx context.Context, req domain.ListArtists) ([]domain.ArtistsBase, error)
	Create(ctx context.Context, name string) (domain.ArtistsBase, error)

	// LikeArtist adds an artist to the caller's liked artists.
	LikeArtist(ctx context.Context, artistUuid string) error
	// UnlikeArtist removes an artist from the caller's liked artists.
	UnlikeArtist(ctx context.Context, artistUuid string) error

	// GetArtistPage returns the artist header plus its albums/singles/features
	// rows for the artist detail page.
	GetArtistPage(ctx context.Context, artistUuid string) (domain.ArtistPage, error)
	// Update edits an artist's name and/or avatar/background-cover images.
	// Requires the caller to have CanEditArtists permission.
	Update(ctx context.Context, req domain.UpdateArtistParams) (domain.UpdateArtistResult, error)
}

type FileService interface {
	SaveFile(ctx context.Context, fileNameWithExt string, content io.Reader) (int64, error)
	ListUploadedFiles(ctx context.Context, req domain.ListUploadedFiles) ([]domain.SongFile, error)
	GetFile(ctx context.Context, fileId int64) (domain.FileMeta, error)
	CheckFilesByHashes(ctx context.Context, hashes []string) ([]domain.FoundFileByHash, error)
	DeleteUploadedFile(ctx context.Context, fileId int64) error
	DeleteUploadedFiles(ctx context.Context, fileIds []int64) error
}

type FeatureFlagsService interface {
	GetAll(ctx context.Context) ([]domain.FeatureFlag, error)
}

type HomeService interface {
	GetFeed(ctx context.Context, req domain.GetFeedRequest) (domain.GetFeedResult, error)
}

type NotificationService interface {
	// GetSummary returns the number of unread notifications for the caller.
	GetSummary(ctx context.Context) (unreadCount int64, err error)
	// List returns a page of notifications for the caller along with the total count.
	List(ctx context.Context, limit, offset uint64) (notifications []domain.Notification, total int64, err error)
	// MarkRead marks a notification as read for the caller. Idempotent.
	MarkRead(ctx context.Context, notificationID int64) error
	// Consent records the caller's consent to a notification, also marking it read.
	Consent(ctx context.Context, notificationID int64) error

	// CreateAndBroadcast creates a new notification and snapshots the current
	// set of users as its recipients. Called by the Telegram bot's admin
	// notify commands - not exposed over gRPC.
	CreateAndBroadcast(ctx context.Context, title, body string, requiresConsent bool) error
}
