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

const tmpFolder = "tmp"

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
	tempPath := path.Join(l.root, tmpFolder, strconv.FormatInt(userId, 10), filePath)

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

func (l LocalStorageProvider) ListFiles(_ context.Context, userId int64) ([]string, error) {
	userTmpDir := path.Join(l.root, tmpFolder, strconv.FormatInt(userId, 10))

	entries, err := os.ReadDir(userTmpDir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, rerrors.Wrap(err, "error reading user temporary directory")
	}

	var files []string
	for _, entry := range entries {
		if !entry.IsDir() {
			files = append(files, path.Join(userTmpDir, entry.Name()))
		}
	}

	return files, nil
}

func (l LocalStorageProvider) Move(_ context.Context, fromPath, newPath string) error {
	fullNewPath := path.Join(l.root, newPath)
	err := verifyFolderExists(path.Dir(fullNewPath))
	if err != nil {
		return rerrors.Wrap(err, "error verifying destination folder exists")
	}

	err = os.Rename(fromPath, fullNewPath)
	if err != nil {
		return rerrors.Wrap(err, "error renaming/moving file")
	}

	return nil
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
