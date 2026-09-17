package v1

import (
	"bytes"
	"context"
	"database/sql"
	"path"
	"strconv"
	"sync"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

// fakeJobStorage is an in-memory test double for storage.JobStorage that only
// records the audio-parse jobs the upload pipeline enqueues.
type fakeJobStorage struct {
	mu               sync.Mutex
	audioParseFileId []int64
	audioParsePath   []string
	garbagePaths     []string
}

func newFakeJobStorage() *fakeJobStorage {
	return &fakeJobStorage{}
}

func (f *fakeJobStorage) WithTx(_ *sql.Tx) storage.JobStorage {
	return f
}

func (f *fakeJobStorage) Enqueue(_ context.Context, _ string, _ any, _ int32) error {
	return nil
}

func (f *fakeJobStorage) EnqueueGarbageFile(_ context.Context, filePath string) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	f.garbagePaths = append(f.garbagePaths, filePath)

	return nil
}

func (f *fakeJobStorage) EnqueueAudioParseJob(_ context.Context, fileId int64, filePath string) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	f.audioParseFileId = append(f.audioParseFileId, fileId)
	f.audioParsePath = append(f.audioParsePath, filePath)

	return nil
}

func (f *fakeJobStorage) Claim(_ context.Context, _ string, _ int32) ([]storage.Job, error) {
	return nil, nil
}

func (f *fakeJobStorage) Complete(_ context.Context, _ int64) error {
	return nil
}

func (f *fakeJobStorage) Fail(_ context.Context, _ int64, _ string, _ int32) error {
	return nil
}

func (f *fakeJobStorage) RequeueStalled(_ context.Context) error {
	return nil
}

// newTestUploadPipeline wires the shared upload core to in-memory fakes.
func newTestUploadPipeline() (uploadPipeline, *fakeSaveFileBinaryStorage, *fakeFileMetaStorage, *fakeJobStorage) {
	binaryStorage := newFakeSaveFileBinaryStorage()
	fileMetaStorage := newFakeFileMetaStorage()
	jobStorage := newFakeJobStorage()

	pipeline := uploadPipeline{
		fileMeta:      fileMetaStorage,
		binaryStorage: binaryStorage,
		jobs:          jobStorage,
	}

	return pipeline, binaryStorage, fileMetaStorage, jobStorage
}

// testUploadRequest builds an upload request with generous limits, so tests
// exercise path/dedup behavior rather than quota branches.
func testUploadRequest(fileName string, folderRelDir string, content []byte) uploadRequest {
	req := uploadRequest{
		UserId:              1,
		FileNameWithExt:     fileName,
		FolderRelDir:        folderRelDir,
		Content:             bytes.NewReader(content),
		MaxSongSizeBytes:    10 << 20,
		MaxTotalUploadBytes: 10 << 20,
	}

	return req
}

// TestUploadPipeline_Store_PlainNamesKeptWhenNoCollision verifies that
// uploads with distinct names keep their exact original names - no
// content-hash renaming at all.
func TestUploadPipeline_Store_PlainNamesKeptWhenNoCollision(t *testing.T) {
	pipeline, _, fileMetaStorage, _ := newTestUploadPipeline()

	ctx := context.Background()

	req1 := testUploadRequest("track1.mp3", "", []byte("first-track-content"))
	id1, _, err := pipeline.store(ctx, req1)
	require.NoError(t, err)

	req2 := testUploadRequest("track2.mp3", "", []byte("second-track-content"))
	id2, _, err := pipeline.store(ctx, req2)
	require.NoError(t, err)

	meta1, err := fileMetaStorage.Get(ctx, id1)
	require.NoError(t, err)
	meta2, err := fileMetaStorage.Get(ctx, id2)
	require.NoError(t, err)

	assert.Equal(t, "tmp/1/track1.mp3", meta1.FilePath)
	assert.Equal(t, "tmp/1/track2.mp3", meta2.FilePath)
}

// TestUploadPipeline_Store_SameNameDifferentContentGetsHashSuffix verifies
// that two different files sharing a target path do not collide: the first
// keeps its plain name, the second gets a 5-hex-char content-hash suffix.
func TestUploadPipeline_Store_SameNameDifferentContentGetsHashSuffix(t *testing.T) {
	pipeline, _, fileMetaStorage, _ := newTestUploadPipeline()

	ctx := context.Background()

	firstContent := []byte("red-track-content")
	secondContent := []byte("green-track-content")

	req1 := testUploadRequest("track.mp3", "", firstContent)
	id1, _, err := pipeline.store(ctx, req1)
	require.NoError(t, err)

	req2 := testUploadRequest("track.mp3", "", secondContent)
	id2, _, err := pipeline.store(ctx, req2)
	require.NoError(t, err)

	assert.NotEqual(t, id1, id2)

	meta1, err := fileMetaStorage.Get(ctx, id1)
	require.NoError(t, err)
	meta2, err := fileMetaStorage.Get(ctx, id2)
	require.NoError(t, err)

	assert.Equal(t, "tmp/1/track.mp3", meta1.FilePath, "first upload should keep its plain original name")

	expectedHash5 := sha256Hex(t, string(secondContent))[:5]
	assert.Equal(t, "tmp/1/track-"+expectedHash5+".mp3", meta2.FilePath)
}

// TestUploadPipeline_Store_IdenticalContentIsDeduplicated preserves the dedup
// behavior: re-uploading identical bytes returns the existing file id and
// leaves only one physical file behind.
func TestUploadPipeline_Store_IdenticalContentIsDeduplicated(t *testing.T) {
	pipeline, binaryStorage, _, _ := newTestUploadPipeline()

	ctx := context.Background()

	content := []byte("identical-track-content")

	req1 := testUploadRequest("track.mp3", "", content)
	id1, _, err := pipeline.store(ctx, req1)
	require.NoError(t, err)

	req2 := testUploadRequest("other-name.mp3", "", content)
	id2, _, err := pipeline.store(ctx, req2)
	require.NoError(t, err)

	assert.Equal(t, id1, id2)
	assert.Len(t, binaryStorage.files, 1, "the duplicate upload's staged file must be cleaned up")
}

// TestUploadPipeline_Store_FolderRelDirIsIncludedInStoredPath verifies that a
// caller-supplied folder segment ends up in the stored path, so imports from
// different folders don't flatten together.
func TestUploadPipeline_Store_FolderRelDirIsIncludedInStoredPath(t *testing.T) {
	pipeline, _, fileMetaStorage, _ := newTestUploadPipeline()

	ctx := context.Background()

	req := testUploadRequest("track.mp3", testFolderName, []byte("foldered-track-content"))
	id, _, err := pipeline.store(ctx, req)
	require.NoError(t, err)

	meta, err := fileMetaStorage.Get(ctx, id)
	require.NoError(t, err)

	assert.Equal(t, path.Join("tmp/1", testFolderName, "track.mp3"), meta.FilePath)
}

// TestUploadPipeline_Store_AudioEnqueuesParseJob verifies that a non-cover
// upload schedules an audio-parse job for the resulting file.
func TestUploadPipeline_Store_AudioEnqueuesParseJob(t *testing.T) {
	pipeline, _, _, jobStorage := newTestUploadPipeline()

	ctx := context.Background()

	req := testUploadRequest("track.mp3", "", []byte("parsable-track-content"))
	id, _, err := pipeline.store(ctx, req)
	require.NoError(t, err)

	require.Len(t, jobStorage.audioParseFileId, 1)
	assert.Equal(t, id, jobStorage.audioParseFileId[0])
	assert.Equal(t, "tmp/1/track.mp3", jobStorage.audioParsePath[0])
}

// TestUploadPipeline_Store_OversizedContentIsRejected verifies the per-file
// size cap aborts the upload and leaves nothing behind.
func TestUploadPipeline_Store_OversizedContentIsRejected(t *testing.T) {
	pipeline, binaryStorage, _, _ := newTestUploadPipeline()

	ctx := context.Background()

	req := testUploadRequest("track.mp3", "", []byte("way-too-large-for-the-cap"))
	req.MaxSongSizeBytes = 4

	id, _, err := pipeline.store(ctx, req)
	require.Error(t, err)
	assert.Zero(t, id)
	assert.Empty(t, binaryStorage.files, "an oversized upload must not leave a staged file behind")
}

// TestUploadPipeline_resolveTargetPath_ExtendsHashPrefixOnRepeatedCollision
// proves the path-selection loop keeps extending the disambiguation hash
// prefix (rather than giving up or erroring) when even the shortest
// disambiguated candidates are already taken.
func TestUploadPipeline_resolveTargetPath_ExtendsHashPrefixOnRepeatedCollision(t *testing.T) {
	fileMetaStorage := newFakeFileMetaStorage()

	pipeline := uploadPipeline{
		fileMeta: fileMetaStorage,
	}

	ctx := context.Background()

	contentHash := sha256Hex(t, "forced-collision-content")
	dir := "tmp/1"

	takenPaths := []string{
		path.Join(dir, "track.mp3"),
		path.Join(dir, "track-"+contentHash[:5]+".mp3"),
		path.Join(dir, "track-"+contentHash[:6]+".mp3"),
	}
	for i, takenPath := range takenPaths {
		fileMeta := domain.FileMeta{
			File: domain.File{
				FilePath:    takenPath,
				ContentHash: "unrelated-hash-" + strconv.Itoa(i),
			},
		}
		_, addErr := fileMetaStorage.Add(ctx, fileMeta)
		require.NoError(t, addErr)
	}

	got, err := pipeline.resolveTargetPath(ctx, dir, "track.mp3", contentHash)
	require.NoError(t, err)

	want := path.Join(dir, "track-"+contentHash[:7]+".mp3")
	assert.Equal(t, want, got)
}

// TestUploadPipeline_resolveTargetPath_FreePathReturnedAsIs verifies that when
// the plain candidate path is not taken, resolveTargetPath returns it
// unchanged - no hash suffix.
func TestUploadPipeline_resolveTargetPath_FreePathReturnedAsIs(t *testing.T) {
	fileMetaStorage := newFakeFileMetaStorage()

	pipeline := uploadPipeline{
		fileMeta: fileMetaStorage,
	}

	ctx := context.Background()

	contentHash := sha256Hex(t, "free-path-content")

	got, err := pipeline.resolveTargetPath(ctx, "tmp/1", "track.mp3", contentHash)
	require.NoError(t, err)

	assert.Equal(t, "tmp/1/track.mp3", got)
}
