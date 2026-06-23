package audio_parser

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/audio_parsers"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/utils"
)

type Handler struct {
	fileMeta      storage.FileMetaStorage
	binaryStorage storage.BinaryFileStorage
}

func New(fileMeta storage.FileMetaStorage, fs storage.BinaryFileStorage) *Handler {
	return &Handler{
		fileMeta:      fileMeta,
		binaryStorage: fs,
	}
}

func (h *Handler) Handle(ctx context.Context, payload storage.AudioParsePayload) error {
	file, err := h.fileMeta.Get(ctx, payload.FileId)
	if err != nil {
		return rerrors.Wrap(err, "get file meta")
	}

	if file.Verified {
		return nil
	}

	rc, err := h.binaryStorage.GetFile(ctx, payload.FilePath)
	if err != nil {
		return rerrors.Wrap(err, "open file for parsing")
	}
	defer utils.CloseWithLog(rc, payload.FilePath)

	info, err := audio_parsers.Parse(payload.FilePath, rc)
	if err != nil {
		return rerrors.Wrap(err, "parse audio file")
	}

	file.Duration = info.Duration
	file.SizeBytes = info.SizeBytes
	file.Verified = true

	err = h.fileMeta.Update(ctx, file.Id, file.File)
	if err != nil {
		return rerrors.Wrap(err, "update file meta after parsing")
	}

	return nil
}
