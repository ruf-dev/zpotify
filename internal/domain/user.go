package domain

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
