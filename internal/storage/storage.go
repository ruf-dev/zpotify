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

	Create(ctx context.Context, song songs_q.CreateSongParams) (int64, error)
	CreateBatch(ctx context.Context, songs []songs_q.CreateSongParams) ([]int64, error)
	UpdateTitle(ctx context.Context, songId int64, title string) error
	ClearArtists(ctx context.Context, songId int64) error

	AddArtist(ctx context.Context, songId int64, artistUuid string, order int) error

	//Save(ctx context.Context, song domain.SongBase) error
	//SaveSongsArtists(ctx context.Context, songId int64, artist uuid.UUID, orderId int16) error

	//AddSongsToPlaylist(ctx context.Context, playlistUuid string, songIds ...int32) error

	//Count(ctx context.Context, r domain.ListSongsInPlaylist) (uint64, error)

	//Get(ctx context.Context, id int64) (domain.SongBase, error)
	//GetByFileId(ctx context.Context, id int64) (domain.SongBase, error)
	//Delete(ctx context.Context, id int64) error
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

	// GetFile - returns file content
	GetFile(ctx context.Context, path string) (io.ReadCloser, error)
}
