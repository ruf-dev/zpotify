package domain

type FileMeta struct {
	AddedByTgId int64
	Title       string
	Author      string
	TgUniqueId  string
	TgFileId    string
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
