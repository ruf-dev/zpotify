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
}

type FileMeta struct {
	TgFile
	AddedByTgId int64
	Title       string
	Author      string
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
}

type ListSongs struct {
	Limit  uint64
	Offset uint64
}

type SongBase struct {
	UniqueFileId string
	Tittle       string
	Artists      []ArtistsBase
	Duration     time.Duration
}

type ArtistsBase struct {
	Uuid string
	Name string
}

type SongsList struct {
	Songs []SongBase
	Total uint64
}
