package v1

import (
	"context"
	"io"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/user_errors"
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
		res = append(res,
			domain.SongFile{
				Path: f,
			})
	}

	return res, nil
}
