package v1

import (
	"context"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
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

func (s *FileService) StoreToLocalStorage(ctx context.Context, name string, content io.Reader) (int64, error) {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return 0, rerrors.New("unauthenticated")
	}

	dataDir := filepath.Join("data", "tmp")
	if _, err := os.Stat(dataDir); os.IsNotExist(err) {
		err = os.MkdirAll(dataDir, 0755)
		if err != nil {
			return 0, rerrors.Wrap(err, "error creating data directory")
		}
	}

	ext := filepath.Ext(name)
	fileName := uuid.New().String() + ext
	fullPath := filepath.Join(dataDir, fileName)

	f, err := os.Create(fullPath)
	if err != nil {
		return 0, rerrors.Wrap(err, "error creating file")
	}
	defer f.Close()

	var parser domain.FileParser
	if strings.HasSuffix(strings.ToLower(name), ".mp3") {
		parser = file_parser.NewMP3Parser()
	}

	var duration time.Duration
	var size int64

	if parser != nil {
		pr, pw := io.Pipe()
		tr := io.TeeReader(content, pw)

		errChan := make(chan error, 1)
		go func() {
			defer pw.Close()
			_, err := io.Copy(f, tr)
			errChan <- err
		}()

		duration, size, err = parser.Parse(pr)
		if err != nil {
			return 0, rerrors.Wrap(err, "error parsing file")
		}

		if err := <-errChan; err != nil {
			return 0, rerrors.Wrap(err, "error writing file content")
		}
	} else {
		size, err = io.Copy(f, content)
		if err != nil {
			return 0, rerrors.Wrap(err, "error writing file content")
		}
	}

	id, err := s.storage.Add(ctx, domain.FileMeta{
		File: domain.File{
			FilePath:  fullPath,
			SizeBytes: size,
			Duration:  duration,
		},
		AddedById: uCtx.UserId,
	})
	if err != nil {
		return 0, rerrors.Wrap(err, "error saving file meta")
	}

	return id, nil
}
