package domain

import (
	"time"
)

type AddAudio struct {
	UniqueFileId string
	TgFileId     string
	AddedByTgId  int64
	Title        string
	Author       string
	Duration     time.Duration
}

type FileMeta struct {
	File
	AddedByTgId int64
}

type SaveFileCode int64

const (
	SaveFileCodeUnknown SaveFileCode = iota
	SaveFileCodeOk                   = iota
	SaveFileCodeAlreadyExists
	SaveFileCodeUserNotAllowed
)

type SaveFileMetaResp struct {
	Code SaveFileCode
}

type TgFile struct {
	UniqueFileId string
	FileId       string
	FilePath     string
	SizeBytes    int64
}

type File struct {
	FilePath  string
	SizeBytes int64
}

type ListSongs struct {
	PlaylistUuid *string
	UniqueIds    []string

	Limit  uint64
	Offset uint64

	OrderBy    SongsOrderBy
	Desc       bool
	RandomHash *uint64
}

type ListFileMeta struct {
	NoSizeBytesFilter bool

	Offset uint64
	Limit  uint64
}

type SongsOrderBy int

const (
	SongsOrderByOrderNumber SongsOrderBy = iota
	SongsOrderByCreatedAt
)

type SongBase struct {
	Id        int32
	Title     string
	FileId    int32
	CreatedAt time.Time
}

type Song struct {
	SongBase
	FileMeta
}

type ArtistsBase struct {
	Uuid string
	Name string
}

type SongsList struct {
	Songs                  []SongBase
	Total                  uint64
	UserPlaylistPermission PlaylistPermissions
}

type ListArtists struct {
	Name []string
}

type SeekFile struct {
	UniqueId string
	Offset   int64
	Limit    int64
}
