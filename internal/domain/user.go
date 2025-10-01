package domain

import (
	"time"
)

type User struct {
	UserInfo
	UserSettings
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

type UserSettings struct {
	Locale string
}

type UserPermissions struct {
	CanUpload bool
	CanDelete bool

	EarlyAccess bool
}

type UserSession struct {
	UserTgId int64

	AccessToken     string
	AccessExpiresAt time.Time

	RefreshToken     string
	RefreshExpiresAt time.Time

	Permissions UserPermissions
}
