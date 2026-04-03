package storage

import (
	"context"
	"database/sql"

	"github.com/google/uuid"

	"go.zpotify.ru/zpotify/internal/domain"
	querier "go.zpotify.ru/zpotify/internal/storage/pg/generated"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
)

type Storage interface {
	User() UserStorage
	UserSettings() UserSettingsStorage
	SessionStorage() SessionStorage

	FileMeta() FileMetaStorage

	SongStorage() SongStorage
	ArtistStorage() ArtistStorage

	PlaylistStorage() PlaylistStorage

	TxManager() *tx_manager.TxManager
}

type UserStorage interface {
	WithTx(tx *sql.Tx) UserStorage

	ListUsers(ctx context.Context, filter domain.GetUserFilter) ([]domain.User, error)
	GetUserById(ctx context.Context, tgId int64) (domain.UserBaseInfo, error)

	Upsert(ctx context.Context, username string) error

	SaveSettings(ctx context.Context, id int64, settings domain.UserUiSettings) error
	SavePermissions(ctx context.Context, id int64, permissions domain.UserPermissions) error
	GetPermissionsOnPlaylist(ctx context.Context, userTgId int64, playlistUuid string) (domain.PlaylistPermissions, error)
	GetPermissions(ctx context.Context, id int64) (domain.UserPermissions, error)
}

type FileMetaStorage interface {
	WithTx(tx *sql.Tx) FileMetaStorage

	// Add - saves meta to storage. Can return ErrAlreadyExists error
	Add(ctx context.Context, user domain.FileMeta) error

	Upsert(ctx context.Context, user domain.FileMeta) error

	Get(ctx context.Context, uniqueFileId int64) (domain.FileMeta, error)

	List(ctx context.Context, listReq domain.ListFileMeta) ([]domain.FileMeta, error)
	Delete(ctx context.Context, uniqueFileId int64) error
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

	Save(ctx context.Context, song domain.SongBase) error
	SaveSongsArtists(ctx context.Context, songId int64, artist uuid.UUID, orderId int16) error

	AddSongsToPlaylist(ctx context.Context, playlistUuid string, songIds ...int32) error

	List(ctx context.Context, r domain.ListSongs) ([]domain.SongBase, error)
	Count(ctx context.Context, r domain.ListSongs) (uint64, error)
	Get(ctx context.Context, id int64) (domain.SongBase, error)
	GetByFileId(ctx context.Context, id int64) (domain.SongBase, error)
	Delete(ctx context.Context, id int64) error
}

type ArtistStorage interface {
	WithTx(tx *sql.Tx) ArtistStorage

	Return(ctx context.Context, artists []string) ([]domain.ArtistsBase, error)
}

type PlaylistStorage interface {
	Create(ctx context.Context, req querier.CreatePlaylistParams) (domain.Playlist, error)
	// GetWithAuth Returns playlist based on weather user has access or playlist is public
	GetWithAuth(ctx context.Context, uuid querier.GetPlaylistWithAuthParams) (domain.Playlist, error)
}

type UserSettingsStorage interface {
	GetHomeSegments(ctx context.Context, userId int64) ([]domain.UserHomeSegment, error)
	GetUiSettings(ctx context.Context, userId int64) (domain.UserUiSettings, error)
}
