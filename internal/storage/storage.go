package storage

import (
	"context"
	"database/sql"
	"io"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/songs_q"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
)

type Storage interface {
	TelegramIdentity() TelegramIdentityStorage
	ZpotifyIdentity() ZpotifyIdentityStorage

	SessionStorage() SessionStorage

	User() UserStorage
	UserSettings() UserSettingsStorage

	SongsStorage() SongStorage
	PlaylistStorage() PlaylistStorage
	ArtistStorage() ArtistStorage
	FileMeta() FileMetaStorage
	Jobs() JobStorage

	TxManager() *tx_manager.TxManager
}

type TelegramIdentityStorage interface {
	WithTx(tx *sql.Tx) TelegramIdentityStorage
	Upsert(ctx context.Context, tgId int64, userId int64, login string) (int64, error)
	GetByTgId(ctx context.Context, tgId int64) (domain.TelegramIdentity, error)
	GetByTgIdTx(ctx context.Context, tgId int64) (sql.Null[domain.TelegramIdentity], error)
}

type ZpotifyIdentityStorage interface {
	WithTx(tx *sql.Tx) ZpotifyIdentityStorage
	GetByLogoPass(ctx context.Context, login string, password string) (domain.ZpotifyIdentity, error)
}

type UserStorage interface {
	WithTx(tx *sql.Tx) UserStorage

	CreateUser(ctx context.Context, username domain.UserBaseInfo) (int64, error)
	GetUserById(ctx context.Context, userId int64) (domain.UserBaseInfo, error)

	SaveSettings(ctx context.Context, id int64, settings domain.UserUiSettings) error
	SavePermissions(ctx context.Context, id int64, permissions domain.UserPermissions) error
	GetPermissionsOnPlaylist(ctx context.Context, userId int64, playlistUuid string) (domain.PlaylistPermissions, error)
	GetPermissions(ctx context.Context, id int64) (domain.UserPermissions, error)
}

type FileMetaStorage interface {
	WithTx(tx *sql.Tx) FileMetaStorage

	// Add - saves meta to storage.
	Add(ctx context.Context, file domain.FileMeta) (int64, error)

	Get(ctx context.Context, fileId int64) (domain.FileMeta, error)
	GetBySongId(ctx context.Context, songId int32) (domain.FileMeta, error)
	GetByPath(ctx context.Context, path string) (domain.FileMeta, error)
	GetByHash(ctx context.Context, hash string, userId int64) (domain.FileMeta, error)

	Update(ctx context.Context, fileId int64, file domain.File) error

	List(ctx context.Context, listReq domain.ListFileMeta) ([]domain.FileMeta, error)
	Delete(ctx context.Context, fileId int64) error
}

type SessionStorage interface {
	WithTx(tx *sql.Tx) SessionStorage

	Upsert(ctx context.Context, user domain.UserSession) error
	GetByAccessToken(ctx context.Context, accessToken string) (domain.UserSession, error)
	GetByRefreshToken(ctx context.Context, refreshToken string) (domain.UserSession, error)

	Delete(ctx context.Context, tokens ...string) error
	ListByUserId(ctx context.Context, id int64) ([]domain.UserSession, error)

	DeleteExpired(ctx context.Context) error
}

type SongStorage interface {
	WithTx(tx *sql.Tx) SongStorage

	GetById(ctx context.Context, songId int64) (domain.Song, error)
	GetByFileId(ctx context.Context, fileId int64) (domain.Song, error)

	Create(ctx context.Context, song songs_q.CreateSongParams) (int64, error)
	CreateBatch(ctx context.Context, songs []songs_q.CreateSongParams) ([]int64, error)
	UpdateTitle(ctx context.Context, songId int64, title string) error
	ClearArtists(ctx context.Context, songId int64) error

	AddArtist(ctx context.Context, songId int64, artistUuid string, order int) error
}

type ArtistStorage interface {
	WithTx(tx *sql.Tx) ArtistStorage

	Return(ctx context.Context, artists []string) ([]domain.ArtistsBase, error)
	List(ctx context.Context, req domain.ListArtists) ([]domain.ArtistsBase, error)
}

type PlaylistStorage interface {
	WithTx(tx *sql.Tx) PlaylistStorage

	Create(ctx context.Context, params domain.CreatePlaylistParams, userId int64) (string, error)
	Get(ctx context.Context, userId int64, playlistUuid string) (domain.Playlist, error)
	Update(ctx context.Context, params domain.UpdatePlaylistParams) error

	GetPlaylistArtists(ctx context.Context, playlistUuid string) ([]domain.ArtistsBase, error)
	AddPlaylistArtist(ctx context.Context, playlistUuid, artistUuid string, orderId int) error
	ClearPlaylistArtists(ctx context.Context, playlistUuid string) error
	UpdateCoverFileId(ctx context.Context, playlistUuid string, coverFileId int64) error

	ListSongs(ctx context.Context, r domain.ListSongs) ([]domain.PlaylistSong, error)
	CountSongs(ctx context.Context, r domain.ListSongs) (uint16, error)

	AddSong(ctx context.Context, playlistUuid string, songId int32) error
	List(ctx context.Context, userId int64, req domain.ListPlaylists) ([]domain.Playlist, error)
	CountPlaylists(ctx context.Context, userId int64) (uint32, error)
}

type UserSettingsStorage interface {
	WithTx(tx *sql.Tx) UserSettingsStorage

	GetHomeSegments(ctx context.Context, userId int64) ([]domain.UserHomeSegment, error)
	GetUiSettings(ctx context.Context, userId int64) (domain.UserUiSettings, error)
	SetHomeSegment(ctx context.Context, userId int64, segment domain.UserHomeSegment) error
}

// BinaryFileStorage - describes a provider to store / retrieve actual binary file data
type BinaryFileStorage interface {
	// SaveToTempFolder - downloads file and stores it to temporary folder
	SaveToTempFolder(ctx context.Context, userId int64, filePath string, content io.Reader) (tempPath string, err error)
	// ListFiles - returns list of files in user's temporary folder
	ListFiles(ctx context.Context, userId int64) (files []string, err error)

	// Move - moves file from one place to another
	Move(ctx context.Context, fromPath string, newPath string) error

	// Copy - copies file from fromPath to toPath; idempotent (overwrites dst if exists)
	Copy(ctx context.Context, fromPath string, toPath string) error

	// Delete - removes a file; idempotent (no error if file does not exist)
	Delete(ctx context.Context, path string) error

	// GetFile - returns file content
	GetFile(ctx context.Context, path string) (io.ReadCloser, error)

	// DeleteTempFile - removes a file from the temporary folder
	DeleteTempFile(ctx context.Context, path string) error
}

const QueueNameGarbageCollector = "garbage_collector"

// GarbageFilePayload is the JSONB payload for garbage_collector queue jobs.
type GarbageFilePayload struct {
	FilePath string `json:"file_path"`
}

const QueueNameAudioParser = "audio_parser"

// AudioParsePayload is the JSONB payload for audio_parser queue jobs.
type AudioParsePayload struct {
	FileId   int64  `json:"file_id"`
	FilePath string `json:"file_path"`
}

// Job is the domain representation of a claimed job row.
type Job struct {
	ID          int64
	QueueName   string
	Payload     []byte
	Attempts    int32
	MaxAttempts int32
}

// JobStorage manages the generic jobs queue.
type JobStorage interface {
	WithTx(tx *sql.Tx) JobStorage

	Enqueue(ctx context.Context, queueName string, payload any, maxAttempts int32) error
	EnqueueGarbageFile(ctx context.Context, filePath string) error
	EnqueueAudioParseJob(ctx context.Context, fileId int64, filePath string) error
	Claim(ctx context.Context, queueName string, limit int32) ([]Job, error)
	Complete(ctx context.Context, jobID int64) error
	Fail(ctx context.Context, jobID int64, lastError string, backoffSeconds int32) error
	RequeueStalled(ctx context.Context) error
}
