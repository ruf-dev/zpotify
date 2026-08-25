package torrent_sync

import (
	"context"
	"database/sql"
	"sync"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

// fakeHandle is a TorrentHandle returning fixed byte counts.
type fakeHandle struct {
	completed int64
	total     int64
}

func (h fakeHandle) AudioBytesCompleted() int64 {
	return h.completed
}

func (h fakeHandle) AudioBytesTotal() int64 {
	return h.total
}

// fakeLookup is a TorrentLookup backed by a map of info hash to handle.
type fakeLookup struct {
	handles map[string]fakeHandle
}

func (l fakeLookup) Torrent(infoHash string) (TorrentHandle, bool) {
	handle, ok := l.handles[infoHash]
	if !ok {
		return nil, false
	}

	return handle, true
}

// recordingImporter records the rows handed to it and can fail on demand.
type recordingImporter struct {
	mu       sync.Mutex
	imported []domain.TorrentDownload
	failWith error
}

func (i *recordingImporter) ImportCompleted(_ context.Context, row domain.TorrentDownload) error {
	i.mu.Lock()
	defer i.mu.Unlock()

	i.imported = append(i.imported, row)

	return i.failWith
}

// progressCall is one recorded UpdateProgress invocation.
type progressCall struct {
	id         int64
	downloaded int64
	total      int64
}

// fakeTorrentStorage records the state transitions the task drives.
type fakeTorrentStorage struct {
	mu sync.Mutex

	active    []domain.TorrentDownload
	progress  []progressCall
	statuses  []domain.TorrentDownloadStatus
	errors    []string
	listError error
}

func (f *fakeTorrentStorage) WithTx(_ *sql.Tx) storage.TorrentDownloadStorage {
	return f
}

func (f *fakeTorrentStorage) Add(_ context.Context, download domain.TorrentDownload) (domain.TorrentDownload, error) {
	return download, nil
}

func (f *fakeTorrentStorage) Get(_ context.Context, _ int64, _ int64) (domain.TorrentDownload, error) {
	return domain.TorrentDownload{}, storage.ErrNotFound
}

func (f *fakeTorrentStorage) ListByUser(_ context.Context, _ int64, _ string) ([]domain.TorrentDownload, error) {
	return nil, nil
}

func (f *fakeTorrentStorage) ListActive(_ context.Context) ([]domain.TorrentDownload, error) {
	if f.listError != nil {
		return nil, f.listError
	}

	return f.active, nil
}

func (f *fakeTorrentStorage) UpdateProgress(_ context.Context, id int64, downloadedBytes int64, totalBytes int64) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	call := progressCall{id: id, downloaded: downloadedBytes, total: totalBytes}
	f.progress = append(f.progress, call)

	return nil
}

func (f *fakeTorrentStorage) UpdateStatus(_ context.Context, _ int64, status domain.TorrentDownloadStatus) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	f.statuses = append(f.statuses, status)

	return nil
}

func (f *fakeTorrentStorage) SetError(_ context.Context, _ int64, errMsg string) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	f.errors = append(f.errors, errMsg)

	return nil
}

func (f *fakeTorrentStorage) SetImportedFiles(_ context.Context, _ int64, _ []string) error {
	return nil
}

func (f *fakeTorrentStorage) Delete(_ context.Context, _ int64, _ int64) error {
	return nil
}

const testInfoHash = "0123456789abcdef0123456789abcdef01234567"

// newTestTask builds a Task around the given fakes without going through New,
// so no goroutine or ticker is started.
func newTestTask(torrentStorage *fakeTorrentStorage, lookup TorrentLookup, importer Importer) *Task {
	ctx, cancel := context.WithCancel(context.Background())

	task := &Task{
		ctx:            ctx,
		stopFunc:       cancel,
		torrentStorage: torrentStorage,
		lookup:         lookup,
		importer:       importer,
	}

	return task
}

func downloadingRow() domain.TorrentDownload {
	return domain.TorrentDownload{
		Id:         7,
		UserId:     1,
		InfoHash:   testInfoHash,
		FolderName: "My Album",
		Status:     domain.TorrentDownloadStatusDownloading,
	}
}

// TestSyncRow_WritesProgressWhileIncomplete verifies a partially downloaded
// torrent only has its byte counts updated - no status change, no import.
func TestSyncRow_WritesProgressWhileIncomplete(t *testing.T) {
	torrentStorage := &fakeTorrentStorage{}
	handle := fakeHandle{completed: 40, total: 100}
	lookup := fakeLookup{handles: map[string]fakeHandle{testInfoHash: handle}}
	importer := &recordingImporter{}

	task := newTestTask(torrentStorage, lookup, importer)

	err := task.syncRow(context.Background(), downloadingRow())
	require.NoError(t, err)

	require.Len(t, torrentStorage.progress, 1)
	wantProgress := progressCall{id: 7, downloaded: 40, total: 100}
	assert.Equal(t, wantProgress, torrentStorage.progress[0])

	assert.Empty(t, torrentStorage.statuses, "an incomplete torrent must not change status")
	assert.Empty(t, importer.imported, "an incomplete torrent must not be imported")
}

// TestSyncRow_ImportsOnceAudioBytesComplete verifies completion is detected
// against the audio-only total and drives the import inline on that tick.
func TestSyncRow_ImportsOnceAudioBytesComplete(t *testing.T) {
	torrentStorage := &fakeTorrentStorage{}
	handle := fakeHandle{completed: 100, total: 100}
	lookup := fakeLookup{handles: map[string]fakeHandle{testInfoHash: handle}}
	importer := &recordingImporter{}

	task := newTestTask(torrentStorage, lookup, importer)

	err := task.syncRow(context.Background(), downloadingRow())
	require.NoError(t, err)

	require.Len(t, torrentStorage.progress, 1)
	wantProgress := progressCall{id: 7, downloaded: 100, total: 100}
	assert.Equal(t, wantProgress, torrentStorage.progress[0])

	require.Len(t, torrentStorage.statuses, 1)
	assert.Equal(t, domain.TorrentDownloadStatusImporting, torrentStorage.statuses[0])

	require.Len(t, importer.imported, 1)
	assert.Equal(t, int64(7), importer.imported[0].Id)
	assert.Equal(t, domain.TorrentDownloadStatusImporting, importer.imported[0].Status)
	assert.Equal(t, int64(100), importer.imported[0].DownloadedBytes)
	assert.Equal(t, int64(100), importer.imported[0].TotalBytes)
}

// TestSyncRow_OvershootStillCountsAsComplete guards against a torrent whose
// completed byte count exceeds the audio total never finishing.
func TestSyncRow_OvershootStillCountsAsComplete(t *testing.T) {
	torrentStorage := &fakeTorrentStorage{}
	handle := fakeHandle{completed: 140, total: 100}
	lookup := fakeLookup{handles: map[string]fakeHandle{testInfoHash: handle}}
	importer := &recordingImporter{}

	task := newTestTask(torrentStorage, lookup, importer)

	err := task.syncRow(context.Background(), downloadingRow())
	require.NoError(t, err)

	assert.Len(t, importer.imported, 1)
}

// TestSyncRow_ZeroTotalIsNeverComplete proves a torrent whose info is not
// available yet cannot trigger an empty import.
func TestSyncRow_ZeroTotalIsNeverComplete(t *testing.T) {
	torrentStorage := &fakeTorrentStorage{}
	handle := fakeHandle{completed: 0, total: 0}
	lookup := fakeLookup{handles: map[string]fakeHandle{testInfoHash: handle}}
	importer := &recordingImporter{}

	task := newTestTask(torrentStorage, lookup, importer)

	err := task.syncRow(context.Background(), downloadingRow())
	require.NoError(t, err)

	assert.Empty(t, torrentStorage.statuses)
	assert.Empty(t, importer.imported)
}

// TestSyncRow_UnknownTorrentIsSkipped covers a job whose torrent is not
// registered - e.g. after a restart. The tick must not touch the row or crash.
func TestSyncRow_UnknownTorrentIsSkipped(t *testing.T) {
	torrentStorage := &fakeTorrentStorage{}
	lookup := fakeLookup{handles: map[string]fakeHandle{}}
	importer := &recordingImporter{}

	task := newTestTask(torrentStorage, lookup, importer)

	err := task.syncRow(context.Background(), downloadingRow())
	require.NoError(t, err)

	assert.Empty(t, torrentStorage.progress)
	assert.Empty(t, torrentStorage.statuses)
	assert.Empty(t, importer.imported)
}

// TestSyncRow_FailedImportMarksJobFailed verifies an import error is recorded
// on the job rather than silently dropped.
func TestSyncRow_FailedImportMarksJobFailed(t *testing.T) {
	torrentStorage := &fakeTorrentStorage{}
	handle := fakeHandle{completed: 100, total: 100}
	lookup := fakeLookup{handles: map[string]fakeHandle{testInfoHash: handle}}
	importer := &recordingImporter{failWith: rerrors.New("disk on fire")}

	task := newTestTask(torrentStorage, lookup, importer)

	err := task.syncRow(context.Background(), downloadingRow())
	require.Error(t, err)

	require.Len(t, torrentStorage.statuses, 2)
	assert.Equal(t, domain.TorrentDownloadStatusImporting, torrentStorage.statuses[0])
	assert.Equal(t, domain.TorrentDownloadStatusFailed, torrentStorage.statuses[1])

	require.Len(t, torrentStorage.errors, 1)
	assert.Contains(t, torrentStorage.errors[0], "disk on fire")
}

// TestDo_SyncsEveryActiveRowEvenIfOneFails proves one bad job does not stop
// the rest of the tick.
func TestDo_SyncsEveryActiveRowEvenIfOneFails(t *testing.T) {
	const otherInfoHash = "89abcdef0123456789abcdef0123456789abcdef"

	firstRow := downloadingRow()
	secondRow := downloadingRow()
	secondRow.Id = 8
	secondRow.InfoHash = otherInfoHash

	torrentStorage := &fakeTorrentStorage{active: []domain.TorrentDownload{firstRow, secondRow}}
	handles := map[string]fakeHandle{
		testInfoHash:  {completed: 100, total: 100},
		otherInfoHash: {completed: 10, total: 100},
	}
	lookup := fakeLookup{handles: handles}
	importer := &recordingImporter{failWith: rerrors.New("nope")}

	task := newTestTask(torrentStorage, lookup, importer)

	err := task.do()
	require.NoError(t, err, "a per-job failure must not abort the tick")

	assert.Len(t, torrentStorage.progress, 2, "both active jobs should have had progress written")
}

func TestDo_PropagatesListError(t *testing.T) {
	torrentStorage := &fakeTorrentStorage{listError: rerrors.New("db down")}
	lookup := fakeLookup{handles: map[string]fakeHandle{}}
	importer := &recordingImporter{}

	task := newTestTask(torrentStorage, lookup, importer)

	err := task.do()
	require.Error(t, err)
}

func TestIsComplete(t *testing.T) {
	assert.False(t, isComplete(0, 0))
	assert.False(t, isComplete(10, 0))
	assert.False(t, isComplete(99, 100))
	assert.True(t, isComplete(100, 100))
	assert.True(t, isComplete(101, 100))
}
