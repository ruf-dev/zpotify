package storage

import (
	"context"
	"database/sql"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
)

type Storage interface {
	User() UserStorage
	FileMeta() FileMetaStorage
	SessionStorage() SessionStorage
	SongStorage() SongStorage
	ArtistStorage() ArtistStorage

	TxManager() *tx_manager.TxManager
}

type UserStorage interface {
	Upsert(ctx context.Context, user domain.UserInfo) error
	SaveSettings(ctx context.Context, id int64, settings domain.UserSettings) error
	GetUser(ctx context.Context, id int64) (domain.User, error)
	GetUserByUsername(ctx context.Context, username string) (domain.User, error)

	WithTx(tx *sql.Tx) UserStorage
}

type FileMetaStorage interface {
	// Add - saves meta to storage. Can return ErrAlreadyExists error
	Add(ctx context.Context, user domain.FileMeta) error
	// Get - gets file
	Get(ctx context.Context, uniqueFileId string) (domain.FileMeta, error)

	WithTx(tx *sql.Tx) FileMetaStorage
}

type SessionStorage interface {
	Upsert(ctx context.Context, user domain.UserSession) error
	GetByAccessToken(ctx context.Context, accessToken string) (domain.UserSession, error)
	GetByRefreshToken(ctx context.Context, refreshToken string) (domain.UserSession, error)

	Delete(ctx context.Context, tokens ...string) error
	ListByUserId(ctx context.Context, id int64) ([]domain.UserSession, error)

	DeleteExpired(ctx context.Context) error

	WithTx(tx *sql.Tx) SessionStorage
}

type SongStorage interface {
	Save(ctx context.Context, song domain.SongBase) error
	List(ctx context.Context, r domain.ListSongs) ([]domain.SongBase, error)
	Count(ctx context.Context, r domain.ListSongs) (uint64, error)
	Get(ctx context.Context, uniqueId string) (domain.SongBase, error)

	WithTx(tx *sql.Tx) SongStorage
}

type ArtistStorage interface {
	Return(ctx context.Context, artists []string) ([]domain.ArtistsBase, error)

	WithTx(tx *sql.Tx) ArtistStorage
}
