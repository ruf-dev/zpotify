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
	SearchService() SearchService
	SearchHistoryService() SearchHistoryService
	TorrentService() TorrentService
}

type service struct {
	audioService         AudioService
	userService          UserService
	authService          AuthService
	playlistService      PlaylistService
	artistsService       ArtistsService
	fileService          FileService
	featureFlagsService  FeatureFlagsService
	homeService          HomeService
	notificationService  NotificationService
	searchService        SearchService
	searchHistoryService SearchHistoryService
	torrentService       TorrentService
}

// New builds the service facade. torrentService is constructed by the caller
// because it needs the process-wide bittorrent client, and the torrent_sync
// background task needs the concrete type - its import entry point is
// deliberately not part of the TorrentService interface below.
func New(dataStorage storage.Storage, cache files_cache.FilesCache,
	fileStorage storage.BinaryFileStorage, adminNotifier auth.AdminNotifier,
	telegramSender v1.TelegramSender,
	torrentService *v1.TorrentService,
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

	audioService := v1.NewAudioService(dataStorage, cache, fileStorage, telegramSender)
	playlistService := v1.NewPlaylistService(dataStorage, fileStorage)
	artistsService := v1.NewArtistsService(dataStorage, fileStorage)

	return &service{
		audioService:         audioService,
		userService:          v1.NewUserService(dataStorage),
		authService:          authSvc,
		playlistService:      playlistService,
		artistsService:       artistsService,
		fileService:          v1.NewFileService(dataStorage, fileStorage),
		featureFlagsService:  v1.NewFeatureFlagsService(dataStorage),
		homeService:          v1.NewHomeService(dataStorage),
		notificationService:  v1.NewNotificationService(dataStorage),
		searchService:        v1.NewSearchService(audioService, artistsService, playlistService),
		searchHistoryService: v1.NewSearchHistoryService(dataStorage),
		torrentService:       torrentService,
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

func (s *service) SearchService() SearchService {
	return s.searchService
}

func (s *service) SearchHistoryService() SearchHistoryService {
	return s.searchHistoryService
}

func (s *service) TorrentService() TorrentService {
	return s.torrentService
}

type AudioService interface {
	GetSong(ctx context.Context, songId int64) (domain.Song, error)

	// SendToTelegram delivers a track's audio file to the requesting user's
	// own linked Telegram chat (bot DM).
	SendToTelegram(ctx context.Context, songId int64) error

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

	// Search finds playlists/albums by name, ranked by full-text relevance,
	// split into albums (results with artists attached) vs plain playlists.
	Search(ctx context.Context, query string, limit, offset uint64) (albums, playlists []domain.PlaylistSearchResult, err error)
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

	// Search finds artists by name, ranked by full-text relevance.
	Search(ctx context.Context, query string, limit, offset uint64) ([]domain.ArtistSearchResult, error)
}

type FileService interface {
	SaveFile(ctx context.Context, fileNameWithExt string, folderName string, content io.Reader) (int64, error)
	ListUploadedFiles(ctx context.Context, req domain.ListUploadedFiles) ([]domain.SongFile, error)
	GetFile(ctx context.Context, fileId int64) (domain.FileMeta, error)
	CheckFilesByHashes(ctx context.Context, hashes []string) ([]domain.FoundFileByHash, error)
	CheckSongsByFileIds(ctx context.Context, fileIds []int64) ([]domain.FoundSongByFileId, error)
	DeleteUploadedFile(ctx context.Context, fileId int64) error
	DeleteUploadedFiles(ctx context.Context, fileIds []int64) error
}

// TorrentService drives user-submitted .torrent downloads. Note that the
// completed-torrent import entry point is intentionally absent here: it is
// called only by the torrent_sync background task, never through the facade.
type TorrentService interface {
	// SubmitTorrent registers a .torrent file for download on the caller's
	// behalf and returns the id of the tracking job row.
	SubmitTorrent(ctx context.Context, torrentFileBytes []byte, folderName string) (int64, error)
	// GetJob returns one of the caller's torrent jobs.
	GetJob(ctx context.Context, jobID int64) (domain.TorrentDownload, error)
	// ListJobs returns the caller's torrent jobs, optionally narrowed to one
	// upload folder (empty folderName returns all folders).
	ListJobs(ctx context.Context, folderName string) ([]domain.TorrentDownload, error)
	// CancelJob stops one of the caller's torrent jobs.
	CancelJob(ctx context.Context, jobID int64) error
	// PauseJob suspends data download for one of the caller's torrent jobs.
	PauseJob(ctx context.Context, jobID int64) error
	// ResumeJob re-enables data download for one of the caller's paused torrent jobs.
	ResumeJob(ctx context.Context, jobID int64) error
	// DeleteJob stops one of the caller's torrent jobs and permanently removes it.
	DeleteJob(ctx context.Context, jobID int64) error
	// WatchJobs returns a channel that streams updates for the caller's torrent jobs,
	// optionally filtered by folder_name. It immediately sends current jobs, then streams updates.
	WatchJobs(ctx context.Context, folderName string, limit int32) (chan domain.TorrentDownload, error)

	// UploadTorrentFile parses a .torrent file and caches it under an opaque
	// handle, without registering it with the bittorrent client or creating a
	// torrent_downloads row. The handle is later passed to GetTorrentFile or
	// SubmitTorrentFile.
	UploadTorrentFile(ctx context.Context, torrentFileBytes []byte) (domain.TorrentFile, error)
	// GetTorrentFile returns a previously uploaded, not-yet-submitted torrent
	// file by its opaque handle.
	GetTorrentFile(ctx context.Context, id string) (domain.TorrentFile, error)
	// SubmitTorrentFile registers a previously uploaded torrent file for
	// download, restricted to the given selected paths, and returns the id
	// of the newly created tracking job.
	SubmitTorrentFile(ctx context.Context, id string, folderName string, selectedPaths []string) (int64, error)
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

// SearchService fans a single free-text query out across tracks, artists,
// albums and playlists. It composes AudioService, ArtistsService and
// PlaylistService rather than duplicating any of their search SQL.
type SearchService interface {
	Search(ctx context.Context, req domain.SearchParams) (domain.SearchResult, error)
}

// SearchHistoryService manages the caller's per-user, FIFO-capped (5
// entries) list of past search queries, each optionally carrying a
// "finding" - the item clicked after that search.
type SearchHistoryService interface {
	// RecordQuery records a new search query for the caller.
	RecordQuery(ctx context.Context, query string) error
	// RecordFinding attaches a finding to the caller's most-recent matching
	// query entry, inserting a new entry if none matched.
	RecordFinding(ctx context.Context, query string, finding domain.SearchHistoryEntry) error
	// List returns up to 5 of the caller's most-recent search history
	// entries, newest first.
	List(ctx context.Context) ([]domain.SearchHistoryEntry, error)
}
