package domain

import (
	"time"

	querier "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

type User struct {
	UserBaseInfo
	UserUiSettings
	Permissions UserPermissions
}

type GetUserFilter struct {
	TgUserId []int64
	Username []string

	Offset uint64
	Limit  uint64
}
type UserBaseInfo struct {
	Id       int64
	Username string
}

type UserUiSettings struct {
	Locale string
}

type UserSettings struct {
	Ui           UserUiSettings
	HomeSegments []UserHomeSegment
}

type UserPermissions struct {
	CanUpload bool

	EarlyAccess bool

	CanCreatePlaylist bool
}

type UserSession struct {
	UserId int64

	AccessToken     string
	AccessExpiresAt time.Time

	RefreshToken     string
	RefreshExpiresAt time.Time
}

type UserHomeSegment querier.UserHomeSegment
