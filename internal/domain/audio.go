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
	AddedById int64
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
	Duration  time.Duration
}

const GlobalPlaylistUuid = "00000000-0000-0000-0000-000000000000"

type ListSongs struct {
	ListSongsFilters

	Limit  uint64
	Offset uint64

	OrderBy    SongsOrderBy
	Desc       bool
	RandomHash *uint64
}

type ListSongsFilters struct {
	PlaylistUuid *string
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
	Id       int32
	Title    string
	Duration time.Duration
	FilePath string
}

type Song struct {
	SongBase
	FileMeta
	Artists []ArtistsBase
}

type ArtistsBase struct {
	Uuid string `json:"uuid"`
	Name string `json:"name"`
}

type SongsList struct {
	Songs []Song
	Total uint16
}

type ListArtists struct {
	Name []string
}

type SeekFile struct {
	UniqueId string
	Offset   int64
	Limit    int64
}
