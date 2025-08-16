package domain

import (
	"time"
)

type User struct {
	UserInfo
	UserSettings
	Permissions UserPermissions
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
}

type UserSession struct {
	UserTgId int64

	AccessToken     string
	AccessExpiresAt time.Time

	RefreshToken     string
	RefreshExpiresAt time.Time
}
