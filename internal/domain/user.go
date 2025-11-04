package domain

import (
	"time"

	querier "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

type User struct {
	UserInfo
	UserUiSettings
	Permissions UserPermissions
}

type GetUserFilter struct {
	TgUserId []int64
	Username []string

	Offset uint64
	Limit  uint64
}
type UserInfo struct {
	TgId       int64
	TgUserName string
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
	CanDelete bool

	EarlyAccess bool

	CanCreatePlaylist bool
}

type UserSession struct {
	UserTgId int64

	AccessToken     string
	AccessExpiresAt time.Time

	RefreshToken     string
	RefreshExpiresAt time.Time

	Permissions UserPermissions
}

type UserHomeSegment querier.UserHomeSegment
