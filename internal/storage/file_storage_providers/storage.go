package file_storage_providers

import (
	"context"
	"io"
	"os"
	"path"
	"strconv"
	"strings"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/utils"
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

	defer utils.CloseWithLog(f, "temp file in SaveToTempFolder")

	_, err = io.Copy(f, content)
	if err != nil {
		return "", rerrors.Wrap(err, "error writing file to temp folder")
	}

	return strings.TrimPrefix(tempPath, l.root), nil
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
	fullFromPath := path.Join(l.root, fromPath)
	fullNewPath := path.Join(l.root, newPath)

	err := verifyFolderExists(path.Dir(fullNewPath))
	if err != nil {
		return rerrors.Wrap(err, "error verifying destination folder exists")
	}

	src, err := os.Open(fullFromPath)
	if err != nil {
		return rerrors.Wrap(err, "error opening source file: "+fullFromPath)
	}
	defer utils.CloseWithLog(src, "source file in Move")

	dst, err := os.Create(fullNewPath)
	if err != nil {
		return rerrors.Wrap(err, "error creating destination file: "+fullNewPath)
	}
	defer utils.CloseWithLog(dst, "destination file in Move")

	_, err = io.Copy(dst, src)
	if err != nil {
		return rerrors.Wrap(err, "error copying file")
	}

	err = os.Remove(fullFromPath)
	if err != nil {
		return rerrors.Wrap(err, "error removing source file after copy")
	}

	return nil
}

func (l LocalStorageProvider) GetFile(_ context.Context, filePath string) (io.ReadCloser, error) {
	filePath = path.Join(l.root, filePath)

	f, err := os.Open(filePath)
	if err != nil {
		return nil, rerrors.Wrap(err, "error opening file")
	}

	return f, nil
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
