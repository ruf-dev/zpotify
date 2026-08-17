package v1

import (
	"bytes"
	"context"
	"database/sql"
	"image"
	"image/color"
	"image/jpeg"
	"io"
	"os"
	"path"
	"strconv"
	"sync"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

// fakeSaveFileBinaryStorage is an in-memory test double for
// storage.BinaryFileStorage, keyed by path exactly like LocalStorageProvider,
// so tests can observe path collisions the same way the real disk-backed
// implementation would.
type fakeSaveFileBinaryStorage struct {
	mu    sync.Mutex
	files map[string][]byte
}

func newFakeSaveFileBinaryStorage() *fakeSaveFileBinaryStorage {
	return &fakeSaveFileBinaryStorage{files: make(map[string][]byte)}
}

func (f *fakeSaveFileBinaryStorage) SaveToTempFolder(_ context.Context, userId int64, filePath string, content io.Reader) (string, error) {
	data, err := io.ReadAll(content)
	if err != nil {
		return "", err
	}

	tempPath := path.Join("tmp", strconv.FormatInt(userId, 10), filePath)

	f.mu.Lock()
	f.files[tempPath] = data
	f.mu.Unlock()

	return tempPath, nil
}

func (f *fakeSaveFileBinaryStorage) ListFiles(_ context.Context, _ int64) ([]string, error) {
	return nil, nil
}

func (f *fakeSaveFileBinaryStorage) Move(_ context.Context, fromPath, newPath string) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	data, ok := f.files[fromPath]
	if !ok {
		return os.ErrNotExist
	}
	f.files[newPath] = data
	delete(f.files, fromPath)
	return nil
}

func (f *fakeSaveFileBinaryStorage) Copy(_ context.Context, fromPath, toPath string) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	data, ok := f.files[fromPath]
	if !ok {
		return os.ErrNotExist
	}
	f.files[toPath] = data
	return nil
}

func (f *fakeSaveFileBinaryStorage) Delete(_ context.Context, filePath string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	delete(f.files, filePath)
	return nil
}

func (f *fakeSaveFileBinaryStorage) GetFile(_ context.Context, filePath string) (io.ReadCloser, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	data, ok := f.files[filePath]
	if !ok {
		return nil, os.ErrNotExist
	}
	return io.NopCloser(bytes.NewReader(data)), nil
}

func (f *fakeSaveFileBinaryStorage) DeleteTempFile(ctx context.Context, filePath string) error {
	return f.Delete(ctx, filePath)
}

// fakeFileMetaStorage is an in-memory test double for storage.FileMetaStorage
// that enforces file_path uniqueness, mirroring the files_meta_file_path_unique
// Postgres index so tests catch path collisions the same way the real DB would.
type fakeFileMetaStorage struct {
	mu     sync.Mutex
	byId   map[int64]domain.FileMeta
	byPath map[string]int64
	byHash map[string]int64
	nextId int64
}

func newFakeFileMetaStorage() *fakeFileMetaStorage {
	return &fakeFileMetaStorage{
		byId:   make(map[int64]domain.FileMeta),
		byPath: make(map[string]int64),
		byHash: make(map[string]int64),
	}
}

func (f *fakeFileMetaStorage) WithTx(_ *sql.Tx) storage.FileMetaStorage {
	return f
}

func (f *fakeFileMetaStorage) Add(_ context.Context, file domain.FileMeta) (int64, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	if _, exists := f.byPath[file.FilePath]; exists {
		return 0, storage.ErrAlreadyExists
	}

	f.nextId++
	id := f.nextId
	file.Id = id
	f.byId[id] = file
	f.byPath[file.FilePath] = id
	f.byHash[file.ContentHash] = id

	return id, nil
}

func (f *fakeFileMetaStorage) Get(_ context.Context, fileId int64) (domain.FileMeta, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	meta, ok := f.byId[fileId]
	if !ok {
		return domain.FileMeta{}, storage.ErrNotFound
	}
	return meta, nil
}

func (f *fakeFileMetaStorage) GetBySongId(_ context.Context, _ int32) (domain.FileMeta, error) {
	return domain.FileMeta{}, storage.ErrNotFound
}

func (f *fakeFileMetaStorage) GetByPath(_ context.Context, p string) (domain.FileMeta, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	id, ok := f.byPath[p]
	if !ok {
		return domain.FileMeta{}, storage.ErrNotFound
	}
	return f.byId[id], nil
}

func (f *fakeFileMetaStorage) GetByHash(_ context.Context, hash string, _ int64) (domain.FileMeta, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	id, ok := f.byHash[hash]
	if !ok {
		return domain.FileMeta{}, storage.ErrNotFound
	}
	return f.byId[id], nil
}

func (f *fakeFileMetaStorage) GetTotalSizeByUser(_ context.Context, _ int64) (int64, error) {
	return 0, nil
}

func (f *fakeFileMetaStorage) Update(_ context.Context, fileId int64, file domain.File) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	meta, ok := f.byId[fileId]
	if !ok {
		return storage.ErrNotFound
	}
	meta.File = file
	f.byId[fileId] = meta
	return nil
}

func (f *fakeFileMetaStorage) List(_ context.Context, _ domain.ListFileMeta) ([]domain.FileMeta, error) {
	return nil, nil
}

func (f *fakeFileMetaStorage) Delete(_ context.Context, fileId int64) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	delete(f.byId, fileId)
	return nil
}

func encodeTestJPEG(t *testing.T, c color.RGBA) []byte {
	t.Helper()

	img := image.NewRGBA(image.Rect(0, 0, 4, 4))
	for y := 0; y < 4; y++ {
		for x := 0; x < 4; x++ {
			img.Set(x, y, c)
		}
	}

	var buf bytes.Buffer
	err := jpeg.Encode(&buf, img, nil)
	require.NoError(t, err)

	return buf.Bytes()
}

func uploadPermissions() domain.UserPermissions {
	return domain.UserPermissions{
		CanUpload:           true,
		MaxPendingTracks:    10,
		MaxSongSizeBytes:    10 << 20,
		MaxTotalUploadBytes: 10 << 20,
	}
}

// TestFileService_SaveFile_SameOriginalFileNameDifferentContent reproduces
// the 409 "conflict saving to local storage" bug: two different photos
// uploaded under the same original file name (e.g. both named "or.jpeg")
// must not collide on files_meta's unique file_path index.
func TestFileService_SaveFile_SameOriginalFileNameDifferentContent(t *testing.T) {
	binaryStorage := newFakeSaveFileBinaryStorage()
	fileMetaStorage := newFakeFileMetaStorage()

	svc := &FileService{
		storage:       fileMetaStorage,
		binaryStorage: binaryStorage,
	}

	ctx := contextWithPermissions(1, uploadPermissions())

	redImage := encodeTestJPEG(t, color.RGBA{R: 255, A: 255})
	greenImage := encodeTestJPEG(t, color.RGBA{G: 255, A: 255})

	id1, err := svc.SaveFile(ctx, "or.jpeg", bytes.NewReader(redImage))
	require.NoError(t, err)

	id2, err := svc.SaveFile(ctx, "or.jpeg", bytes.NewReader(greenImage))
	require.NoError(t, err, "uploading a second, different photo under the same original file name must not conflict")

	assert.NotEqual(t, id1, id2)
}

// TestFileService_SaveFile_IdenticalContentIsDeduplicated preserves the
// existing dedup behavior: re-uploading the exact same content returns the
// same file id instead of erroring or creating a duplicate row.
func TestFileService_SaveFile_IdenticalContentIsDeduplicated(t *testing.T) {
	binaryStorage := newFakeSaveFileBinaryStorage()
	fileMetaStorage := newFakeFileMetaStorage()

	svc := &FileService{
		storage:       fileMetaStorage,
		binaryStorage: binaryStorage,
	}

	ctx := contextWithPermissions(1, uploadPermissions())

	img := encodeTestJPEG(t, color.RGBA{B: 255, A: 255})

	id1, err := svc.SaveFile(ctx, "or.jpeg", bytes.NewReader(img))
	require.NoError(t, err)

	id2, err := svc.SaveFile(ctx, "other-name.jpeg", bytes.NewReader(img))
	require.NoError(t, err)

	assert.Equal(t, id1, id2)
}
