package v1

import (
	"context"
	"io"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/audio_parsers"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/user_errors"
	"go.zpotify.ru/zpotify/internal/utils"
)

type FileService struct {
	storage storage.FileMetaStorage

	binaryStorage storage.BinaryFileStorage
}

func NewFileService(s storage.Storage, binaryStorage storage.BinaryFileStorage) *FileService {
	return &FileService{
		storage:       s.FileMeta(),
		binaryStorage: binaryStorage,
	}
}

func (s *FileService) SaveFile(ctx context.Context, fileNameWithExt string, content io.Reader) (int64, error) {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return 0, rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	if !uCtx.Permissions.CanUpload {
		return 0, rerrors.Wrap(user_errors.ErrPermissionDenied, "not allowed to upload file")
	}

	tmpFilePath, err := s.binaryStorage.SaveToTempFolder(ctx, uCtx.UserId, fileNameWithExt, content)
	if err != nil {
		return 0, rerrors.Wrap(err, "error storing to temporary folder")
	}

	fileMetaUpdate := domain.FileMeta{
		File: domain.File{
			FilePath: tmpFilePath,
		},
		AddedById: uCtx.UserId,
	}

	id, err := s.storage.Add(ctx, fileMetaUpdate)
	if err != nil {
		return 0, rerrors.Wrap(err, "error saving file meta")
	}

	return id, nil
}

func (s *FileService) ListUploadedFiles(ctx context.Context, req domain.ListUploadedFiles) ([]domain.SongFile, error) {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return nil, rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	files, err := s.binaryStorage.ListFiles(ctx, uCtx.UserId)
	if err != nil {
		return nil, rerrors.Wrap(err, "error listing files from binary storage")
	}

	res := make([]domain.SongFile, 0, len(files))
	for _, f := range files {
		sf := domain.SongFile{
			Path: f,
		}

		meta, err := s.storage.GetByPath(ctx, f)
		if err == nil {
			sf.Id = meta.Id
		}

		res = append(res, sf)
	}

	return res, nil
}

func (s *FileService) GetFile(ctx context.Context, fileId int64) (domain.FileMeta, error) {
	file, err := s.storage.Get(ctx, fileId)
	if err != nil {
		return domain.FileMeta{}, rerrors.Wrap(err, "error getting file meta from storage")
	}

	if file.Verified {
		return file, nil
	}

	rc, err := s.binaryStorage.GetFile(ctx, file.FilePath)
	if err != nil {
		return domain.FileMeta{}, rerrors.Wrap(err, "error opening file for parsing")
	}
	defer utils.CloseWithLog(rc, file.FilePath)

	info, err := audio_parsers.ParseMP3(rc)
	if err != nil {
		return domain.FileMeta{}, rerrors.Wrap(err, "error parsing mp3 file")
	}

	file.Duration = info.Duration
	file.SizeBytes = info.SizeBytes
	file.Verified = true

	if uErr := s.storage.Update(ctx, file.Id, file.File); uErr != nil {
		return domain.FileMeta{}, rerrors.Wrap(uErr, "error updating file meta after parsing")
	}

	return file, nil
}
