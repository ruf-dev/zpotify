package domain

import (
	"database/sql"
	"encoding/json"
	"time"

	querier "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

type User struct {
	UserBaseInfo
	UserUiSettings
	Permissions UserPermissions
}

type GetUserFilter struct {
	UserId   []int64
	Username []string

	Offset uint64
	Limit  uint64
}
type UserBaseInfo struct {
	Id       int64
	Username string
	PhotoUrl sql.Null[string]
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

type PlaylistSegment struct {
	PlaylistID string `json:"playlist_id"`
}

func DefaultSegments(userID int64) []UserHomeSegment {
	defaultPlaylist := PlaylistSegment{PlaylistID: "00000000-0000-0000-0000-000000000000"}
	segmentJSON, _ := json.Marshal(defaultPlaylist)

	defaultSegment := UserHomeSegment{
		UserID:      userID,
		Segment:     segmentJSON,
		Type:        querier.UserHomeSegmentTypePlaylist,
		OrderNumber: 1,
	}

	return []UserHomeSegment{defaultSegment}
}

type TelegramIdentity struct {
	UserId int64

	TelegramId int64
	Login      string
}

type ZpotifyIdentity struct {
	UserId int64

	Login    string
	Password string
}
