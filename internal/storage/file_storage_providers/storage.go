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
	tempPath := path.Join(tmpFolder, strconv.FormatInt(userId, 10), filePath)

	f, err := l.openFile(path.Join(l.root, tempPath))
	if err != nil {
		return "", rerrors.Wrap(err, `error opening file to write to`)
	}

	defer utils.CloseWithLog(f, "temp file in SaveToTempFolder")

	_, err = io.Copy(f, content)
	if err != nil {
		return "", rerrors.Wrap(err, "error writing file to temp folder")
	}

	return tempPath, nil
}

func (l LocalStorageProvider) ListFiles(_ context.Context, userId int64) ([]string, error) {
	userTmpDir := path.Join(tmpFolder, strconv.FormatInt(userId, 10))

	entries, err := os.ReadDir(path.Join(l.root, userTmpDir))
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, rerrors.Wrap(err, "error reading user temporary directory")
	}

	var files []string
	for _, entry := range entries {
		if !entry.IsDir() {
			filePath := path.Join(userTmpDir, entry.Name())
			files = append(files, filePath)
		}
	}

	return files, nil
}

func (l LocalStorageProvider) Move(_ context.Context, fromPath, newPath string) error {
	fullFromPath := path.Join(l.root, fromPath)
	fullNewPath := path.Join(l.root, newPath)

	err := copyFileAtomic(fullFromPath, fullNewPath)
	if err != nil {
		return rerrors.Wrap(err, "error moving file")
	}

	err = os.Remove(fullFromPath)
	if err != nil {
		return rerrors.Wrap(err, "error removing source file after move")
	}

	return nil
}

func (l LocalStorageProvider) Copy(_ context.Context, fromPath, toPath string) error {
	fullFromPath := path.Join(l.root, fromPath)
	fullToPath := path.Join(l.root, toPath)

	err := copyFileAtomic(fullFromPath, fullToPath)
	if err != nil {
		return rerrors.Wrap(err, "error copying file")
	}

	return nil
}

// copyFileAtomic copies fullFromPath into fullToPath by writing to a temp
// file in the destination directory and renaming it into place, so a crash
// or concurrent reader can never observe a partially-written file at
// fullToPath.
func copyFileAtomic(fullFromPath, fullToPath string) error {
	err := verifyFolderExists(path.Dir(fullToPath))
	if err != nil {
		return rerrors.Wrap(err, "error verifying destination folder exists")
	}

	src, err := os.Open(fullFromPath)
	if err != nil {
		return rerrors.Wrap(err, "error opening source file: "+fullFromPath)
	}
	defer utils.CloseWithLog(src, "source file in copyFileAtomic")

	dst, err := os.CreateTemp(path.Dir(fullToPath), ".upload-*.tmp")
	if err != nil {
		return rerrors.Wrap(err, "error creating temp destination file")
	}
	tmpPath := dst.Name()

	_, err = io.Copy(dst, src)
	if err != nil {
		utils.CloseWithLog(dst, "temp destination file in copyFileAtomic")
		removeTempFile(tmpPath)
		return rerrors.Wrap(err, "error copying file content")
	}

	err = dst.Sync()
	if err != nil {
		utils.CloseWithLog(dst, "temp destination file in copyFileAtomic")
		removeTempFile(tmpPath)
		return rerrors.Wrap(err, "error syncing destination file")
	}

	err = dst.Close()
	if err != nil {
		removeTempFile(tmpPath)
		return rerrors.Wrap(err, "error closing destination file")
	}

	err = os.Rename(tmpPath, fullToPath)
	if err != nil {
		removeTempFile(tmpPath)
		return rerrors.Wrap(err, "error renaming temp file into place")
	}

	return nil
}

func removeTempFile(tmpPath string) {
	err := os.Remove(tmpPath)
	if err != nil && !os.IsNotExist(err) {
		log.Error().
			Err(err).
			Str("path", tmpPath).
			Msg("error removing leftover temp file")
	}
}

func (l LocalStorageProvider) Delete(_ context.Context, filePath string) error {
	err := os.Remove(path.Join(l.root, filePath))
	if err != nil && !os.IsNotExist(err) {
		return rerrors.Wrap(err, "error deleting file")
	}
	return nil
}

func (l LocalStorageProvider) DeleteTempFile(_ context.Context, filePath string) error {
	fullPath := path.Join(l.root, filePath)
	err := os.Remove(fullPath)
	if err != nil && !os.IsNotExist(err) {
		return rerrors.Wrap(err, "error deleting temp file")
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
		return nil, rerrors.Wrap(err, "error verifying folder exists before open file")
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
