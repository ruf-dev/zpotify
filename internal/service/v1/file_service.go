package v1

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/pkg/file_parser"
	"go.zpotify.ru/zpotify/internal/storage"
)

type FileService struct {
	storage storage.FileMetaStorage
}

func NewFileService(s storage.Storage) *FileService {
	return &FileService{
		storage: s.FileMeta(),
	}
}

func (s *FileService) Create(ctx context.Context, name string) (int64, error) {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return 0, rerrors.New("unauthenticated")
	}

	id, err := s.storage.Add(ctx, domain.FileMeta{
		File: domain.File{
			FilePath: name,
		},
		AddedById: uCtx.UserId,
	})
	if err != nil {
		return 0, rerrors.Wrap(err, "error creating file meta")
	}

	return id, nil
}

func (s *FileService) Upload(ctx context.Context, id int64, content []byte) (string, error) {
	meta, err := s.storage.Get(ctx, id)
	if err != nil {
		return "", rerrors.Wrap(err, "error getting file meta")
	}

	// For now, let's assume we save it in a 'data' directory
	dataDir := "data"
	if _, err := os.Stat(dataDir); os.IsNotExist(err) {
		err = os.MkdirAll(dataDir, 0755)
		if err != nil {
			return "", rerrors.Wrap(err, "error creating data directory")
		}
	}

	fileName := fmt.Sprintf("%d_%s", id, filepath.Base(meta.FilePath))
	fullPath := filepath.Join(dataDir, fileName)

	err = os.WriteFile(fullPath, content, 0644)
	if err != nil {
		return "", rerrors.Wrap(err, "error writing file content")
	}

	var parser domain.FileParser
	if strings.HasSuffix(strings.ToLower(meta.FilePath), ".mp3") {
		parser = file_parser.NewMP3Parser()
	}

	if parser != nil {
		duration, size, err := parser.Parse(content)
		if err != nil {
			// We might not want to fail the whole upload if parsing fails,
			// but for now let's be strict or at least log it.
			return fullPath, rerrors.Wrap(err, "error parsing file")
		}

		err = s.storage.Update(ctx, id, domain.File{
			FilePath:  meta.FilePath,
			SizeBytes: size,
			Duration:  duration,
		})
		if err != nil {
			return fullPath, rerrors.Wrap(err, "error updating file meta")
		}
	}

	return fullPath, nil
}
