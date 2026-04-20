package storage

import (
	"context"
	"database/sql"
	"io"

	"go.zpotify.ru/zpotify/internal/domain"
	auth_q "go.zpotify.ru/zpotify/internal/storage/pg/generated/auth"
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/songs_q"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
)

type Storage interface {

	//FileMeta() FileMetaStorage
	//
	//ArtistStorage() ArtistStorage
	//

	Auth() AuthStorage
	SessionStorage() SessionStorage

	User() UserStorage
	UserSettings() UserSettingsStorage

	SongsStorage() SongStorage
	PlaylistStorage() PlaylistStorage
	FileMeta() FileMetaStorage

	TxManager() *tx_manager.TxManager
}

type AuthStorage interface {
	CreateUserIdentity(ctx context.Context, params auth_q.CreateUserIdentityParams) error
	GetIdentitiesByUsernameAndProvider(ctx context.Context,
		username string, provider auth_q.IdentityProvider) (auth_q.UserIdentity, error)
}

type UserStorage interface {
	WithTx(tx *sql.Tx) UserStorage
	GetUserById(ctx context.Context, userId int64) (domain.UserBaseInfo, error)

	//ListUsers(ctx context.Context, filter domain.GetUserFilter) ([]domain.User, error)

	Upsert(ctx context.Context, username string) error

	SaveSettings(ctx context.Context, id int64, settings domain.UserUiSettings) error
	SavePermissions(ctx context.Context, id int64, permissions domain.UserPermissions) error
	GetPermissionsOnPlaylist(ctx context.Context, userTgId int64, playlistUuid string) (domain.PlaylistPermissions, error)
	GetPermissions(ctx context.Context, id int64) (domain.UserPermissions, error)
}

type FileMetaStorage interface {
	WithTx(tx *sql.Tx) FileMetaStorage

	// Add - saves meta to storage.
	Add(ctx context.Context, file domain.FileMeta) (int64, error)

	Get(ctx context.Context, fileId int64) (domain.FileMeta, error)

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

	Create(ctx context.Context, song songs_q.CreateSongParams) (int64, error)

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
}

type PlaylistStorage interface {
	//Create(ctx context.Context, req querier.CreatePlaylistParams) (domain.Playlist, error)

	ListSongs(ctx context.Context, r domain.ListSongs) ([]domain.PlaylistSong, error)
	CountSongs(ctx context.Context, r domain.ListSongs) (uint16, error)

	AddSong(ctx context.Context, playlistUuid string, songId int32) error
}

type UserSettingsStorage interface {
	GetHomeSegments(ctx context.Context, userId int64) ([]domain.UserHomeSegment, error)
	GetUiSettings(ctx context.Context, userId int64) (domain.UserUiSettings, error)
}

// BinaryFileStorage - describes a provider to store / retrieve actual binary file data
type BinaryFileStorage interface {
	// SaveToTempFolder - downloads file and stores it to temporary folder
	SaveToTempFolder(ctx context.Context, userId int64, filePath string, content io.Reader) (tempPath string, err error)
}
