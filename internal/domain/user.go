package domain

type User struct {
	UserInfo
	UserSettings
}

type UserInfo struct {
	TgId       int64
	TgUserName string
}

type UserSettings struct {
	Locale string
}
