package file_storage_providers

import (
	"context"
	"io"
	"os"
	"path"
	"strconv"

	"github.com/rs/zerolog/log"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/storage"
)

type LocalStorageProvider struct {
	root string
}

func NewLocalStorageProvider(rootPath string) (storage.BinaryFileStorage, error) {
	l := &LocalStorageProvider{
		rootPath,
	}

	err := verifyFolderExists(rootPath)
	if err != nil {
		return nil, rerrors.Wrap(err, `error verifying folder exists`)
	}

	return l, nil
}

func (l LocalStorageProvider) SaveToTempFolder(ctx context.Context, userId int64, filePath string, content io.Reader) (string, error) {
	tempPath := path.Join(l.root, strconv.FormatInt(userId, 10), filePath)

	f, err := l.openFile(tempPath)
	if err != nil {
		return "", rerrors.Wrap(err, `error opening file to write to`)
	}

	defer func() {
		cErr := f.Close()
		if cErr != nil {
			log.Err(cErr).
				Msg("error closing file in temp folder when saving")
		}
	}()

	_, err = io.Copy(f, content)
	if err != nil {
		return "", rerrors.Wrap(err, "error writing file to temp folder")
	}

	return tempPath, nil
}

func (l LocalStorageProvider) openFile(fullPath string) (*os.File, error) {
	err := verifyFolderExists(path.Dir(fullPath))
	if err != nil {
		return nil, rerrors.Wrap(err, "error verifying folder exists")
	}

	f, err := os.Create(fullPath)
	if err != nil {
		return f, rerrors.Wrap(err, "error creating file")
	}

	return f, nil
}

func verifyFolderExists(dataDir string) error {
	_, err := os.Stat(dataDir)
	if !os.IsNotExist(err) {
		return nil
	}

	err = os.MkdirAll(dataDir, 0755)
	if err != nil {
		return rerrors.Wrap(err, "error creating data directory")
	}

	return nil
}
