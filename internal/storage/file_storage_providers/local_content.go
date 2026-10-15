package file_storage_providers

import (
	"context"
	"io"
	"os"
	"path"
	"strings"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/utils"
)

type LocalContentStorage struct {
	root string
}

func NewLocalContentStorage(rootPath string) (storage.ContentStorage, error) {
	err := verifyFolderExists(rootPath)
	if err != nil {
		return nil, rerrors.Wrap(err, "error verifying folder exists")
	}

	l := &LocalContentStorage{root: rootPath}

	return l, nil
}

func (l *LocalContentStorage) Put(_ context.Context, filePath string, content io.Reader) error {
	fullPath := path.Join(l.root, filePath)

	err := verifyFolderExists(path.Dir(fullPath))
	if err != nil {
		return rerrors.Wrap(err, "error verifying destination folder exists")
	}

	tmp, err := os.CreateTemp(path.Dir(fullPath), ".upload-*.tmp")
	if err != nil {
		return rerrors.Wrap(err, "error creating temp file")
	}
	tmpPath := tmp.Name()

	err = tmp.Chmod(0644)
	if err != nil {
		utils.CloseWithLog(tmp, "temp file in LocalContentStorage.Put")
		removeTempFile(tmpPath)
		return rerrors.Wrap(err, "error setting file permissions")
	}

	_, err = io.Copy(tmp, content)
	if err != nil {
		utils.CloseWithLog(tmp, "temp file in LocalContentStorage.Put")
		removeTempFile(tmpPath)
		return rerrors.Wrap(err, "error writing file content")
	}

	err = tmp.Sync()
	if err != nil {
		utils.CloseWithLog(tmp, "temp file in LocalContentStorage.Put")
		removeTempFile(tmpPath)
		return rerrors.Wrap(err, "error syncing file")
	}

	err = tmp.Close()
	if err != nil {
		removeTempFile(tmpPath)
		return rerrors.Wrap(err, "error closing temp file")
	}

	err = os.Rename(tmpPath, fullPath)
	if err != nil {
		removeTempFile(tmpPath)
		return rerrors.Wrap(err, "error renaming temp file into place")
	}

	return nil
}

func (l *LocalContentStorage) Get(_ context.Context, filePath string) (io.ReadCloser, error) {
	f, err := os.Open(path.Join(l.root, filePath))
	if err != nil {
		return nil, rerrors.Wrap(err, "error opening file")
	}

	return f, nil
}

func (l *LocalContentStorage) Copy(_ context.Context, fromPath, toPath string) error {
	err := copyFileAtomic(path.Join(l.root, fromPath), path.Join(l.root, toPath))
	if err != nil {
		return rerrors.Wrap(err, "error copying file")
	}

	return nil
}

func (l *LocalContentStorage) Delete(_ context.Context, filePath string) error {
	err := os.Remove(path.Join(l.root, filePath))
	if err != nil && !os.IsNotExist(err) {
		return rerrors.Wrap(err, "error deleting file")
	}

	return nil
}

func (l *LocalContentStorage) Resolve(_ context.Context, _ string) (domain.RemoteTarget, error) {
	return domain.RemoteTarget{}, rerrors.Wrap(storage.ErrNotRemote)
}

func (l *LocalContentStorage) Probe(ctx context.Context) error {
	probePath := ".probe-" + uuid.NewString()
	payload := "probe"

	err := l.Put(ctx, probePath, strings.NewReader(payload))
	if err != nil {
		return rerrors.Wrap(err, "error writing probe file")
	}
	defer l.deleteProbe(ctx, probePath)

	reader, err := l.Get(ctx, probePath)
	if err != nil {
		return rerrors.Wrap(err, "error reading probe file")
	}
	defer utils.CloseWithLog(reader, "probe file in LocalContentStorage.Probe")

	_, err = io.Copy(io.Discard, reader)
	if err != nil {
		return rerrors.Wrap(err, "error reading probe file content")
	}

	return nil
}

func (l *LocalContentStorage) deleteProbe(ctx context.Context, probePath string) {
	err := l.Delete(ctx, probePath)
	if err != nil {
		removeTempFile(path.Join(l.root, probePath))
	}
}
