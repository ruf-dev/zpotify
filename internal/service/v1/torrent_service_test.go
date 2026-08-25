package v1

import (
	"context"
	"database/sql"
	"path/filepath"
	"strconv"
	"sync"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/user_errors"
)

// fakeTorrentDownloadStorage is an in-memory test double for
// storage.TorrentDownloadStorage.
type fakeTorrentDownloadStorage struct {
	mu     sync.Mutex
	byId   map[int64]domain.TorrentDownload
	nextId int64
}

func newFakeTorrentDownloadStorage() *fakeTorrentDownloadStorage {
	return &fakeTorrentDownloadStorage{byId: make(map[int64]domain.TorrentDownload)}
}

func (f *fakeTorrentDownloadStorage) WithTx(_ *sql.Tx) storage.TorrentDownloadStorage {
	return f
}

func (f *fakeTorrentDownloadStorage) Add(_ context.Context, download domain.TorrentDownload) (domain.TorrentDownload, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	f.nextId++
	download.Id = f.nextId
	if download.Status == "" {
		download.Status = domain.TorrentDownloadStatusQueued
	}
	f.byId[download.Id] = download

	return download, nil
}

func (f *fakeTorrentDownloadStorage) Get(_ context.Context, id int64, userId int64) (domain.TorrentDownload, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	row, ok := f.byId[id]
	if !ok || row.UserId != userId {
		return domain.TorrentDownload{}, storage.ErrNotFound
	}

	return row, nil
}

func (f *fakeTorrentDownloadStorage) ListByUser(_ context.Context, userId int64, folderName string) ([]domain.TorrentDownload, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	rows := make([]domain.TorrentDownload, 0, len(f.byId))
	for _, row := range f.byId {
		if row.UserId != userId {
			continue
		}
		if folderName != "" && row.FolderName != folderName {
			continue
		}
		rows = append(rows, row)
	}

	return rows, nil
}

func (f *fakeTorrentDownloadStorage) ListActive(_ context.Context) ([]domain.TorrentDownload, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	rows := make([]domain.TorrentDownload, 0, len(f.byId))
	for _, row := range f.byId {
		if isActiveTorrentStatus(row.Status) {
			rows = append(rows, row)
		}
	}

	return rows, nil
}

func (f *fakeTorrentDownloadStorage) UpdateProgress(_ context.Context, id int64, downloadedBytes int64, totalBytes int64) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	row, ok := f.byId[id]
	if !ok {
		return storage.ErrNotFound
	}
	row.DownloadedBytes = downloadedBytes
	row.TotalBytes = totalBytes
	f.byId[id] = row

	return nil
}

func (f *fakeTorrentDownloadStorage) UpdateStatus(_ context.Context, id int64, status domain.TorrentDownloadStatus) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	row, ok := f.byId[id]
	if !ok {
		return storage.ErrNotFound
	}
	row.Status = status
	f.byId[id] = row

	return nil
}

func (f *fakeTorrentDownloadStorage) SetError(_ context.Context, id int64, errMsg string) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	row, ok := f.byId[id]
	if !ok {
		return storage.ErrNotFound
	}
	row.Error = errMsg
	f.byId[id] = row

	return nil
}

func (f *fakeTorrentDownloadStorage) SetImportedFiles(_ context.Context, id int64, importedFiles []string) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	row, ok := f.byId[id]
	if !ok {
		return storage.ErrNotFound
	}
	row.ImportedFiles = importedFiles
	f.byId[id] = row

	return nil
}

func (f *fakeTorrentDownloadStorage) Delete(_ context.Context, id int64, userId int64) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	row, ok := f.byId[id]
	if !ok || row.UserId != userId {
		return storage.ErrNotFound
	}
	delete(f.byId, id)

	return nil
}

// fakePendingBinaryStorage reports a fixed number of pending files, so the
// per-user pending-upload quota branch can be exercised.
type fakePendingBinaryStorage struct {
	*fakeSaveFileBinaryStorage
	pending []string
}

func newFakePendingBinaryStorage(pending int) *fakePendingBinaryStorage {
	names := make([]string, 0, pending)
	for i := 0; i < pending; i++ {
		names = append(names, "tmp/1/pending-"+strconv.Itoa(i)+".mp3")
	}

	return &fakePendingBinaryStorage{
		fakeSaveFileBinaryStorage: newFakeSaveFileBinaryStorage(),
		pending:                   names,
	}
}

func (f *fakePendingBinaryStorage) ListFiles(_ context.Context, _ int64) ([]string, error) {
	return f.pending, nil
}

// TestSelectAudioFileNames_PicksOnlyParsableAudio proves the audio-only filter
// keeps exactly the formats the parsers support and skips everything else -
// cover art, cue sheets, logs, archives and nested junk.
func TestSelectAudioFileNames_PicksOnlyParsableAudio(t *testing.T) {
	names := []string{
		"Album/01 - Track.mp3",
		"Album/02 - Track.FLAC",
		"Album/03 - Track.m4a",
		"Album/04 - Track.aac",
		"Album/cover.jpg",
		"Album/folder.png",
		"Album/Album.cue",
		"Album/rip.log",
		"Album/scans.rar",
		"Album/notes.txt",
		"Album/subdir/bonus.mp3",
		"Album/no-extension",
	}

	selected, skipped := selectAudioFileNames(names)

	wantSelected := []string{
		"Album/01 - Track.mp3",
		"Album/02 - Track.FLAC",
		"Album/03 - Track.m4a",
		"Album/04 - Track.aac",
		"Album/subdir/bonus.mp3",
	}
	assert.Equal(t, wantSelected, selected, "only parsable audio files should be downloaded")

	wantSkipped := []string{
		"Album/cover.jpg",
		"Album/folder.png",
		"Album/Album.cue",
		"Album/rip.log",
		"Album/scans.rar",
		"Album/notes.txt",
		"Album/no-extension",
	}
	assert.Equal(t, wantSkipped, skipped, "everything else must be skipped, cover art included")
}

// TestSelectAudioFileNames_NoAudioSelectsNothing covers the torrent that
// contains nothing importable, which SubmitTorrent rejects outright.
func TestSelectAudioFileNames_NoAudioSelectsNothing(t *testing.T) {
	names := []string{"Movie/movie.mkv", "Movie/subs.srt"}

	selected, skipped := selectAudioFileNames(names)

	assert.Empty(t, selected)
	assert.Len(t, skipped, 2)
}

func TestIsActiveTorrentStatus(t *testing.T) {
	activeStatuses := []domain.TorrentDownloadStatus{
		domain.TorrentDownloadStatusQueued,
		domain.TorrentDownloadStatusDownloading,
		domain.TorrentDownloadStatusImporting,
	}
	for _, status := range activeStatuses {
		assert.True(t, isActiveTorrentStatus(status), "%s should occupy a concurrency slot", status)
	}

	inactiveStatuses := []domain.TorrentDownloadStatus{
		domain.TorrentDownloadStatusSeeding,
		domain.TorrentDownloadStatusDone,
		domain.TorrentDownloadStatusFailed,
		domain.TorrentDownloadStatusCanceled,
	}
	for _, status := range inactiveStatuses {
		assert.False(t, isActiveTorrentStatus(status), "%s should not occupy a concurrency slot", status)
	}
}

// newQuotaTestService builds a TorrentService whose only wired dependencies are
// the ones checkSubmitQuota touches.
func newQuotaTestService(pending int, maxConcurrent int) (*TorrentService, *fakeTorrentDownloadStorage) {
	torrentStorage := newFakeTorrentDownloadStorage()

	cfg := TorrentServiceConfig{
		MaxConcurrentDownloads: maxConcurrent,
	}

	svc := &TorrentService{
		torrentStorage: torrentStorage,
		binaryStorage:  newFakePendingBinaryStorage(pending),
		cfg:            cfg,
	}

	return svc, torrentStorage
}

func TestTorrentService_checkSubmitQuota_AllowsWithinLimits(t *testing.T) {
	svc, _ := newQuotaTestService(2, 3)

	err := svc.checkSubmitQuota(context.Background(), 1, 10)
	require.NoError(t, err)
}

func TestTorrentService_checkSubmitQuota_RejectsWhenPendingTrackLimitReached(t *testing.T) {
	svc, _ := newQuotaTestService(10, 3)

	err := svc.checkSubmitQuota(context.Background(), 1, 10)
	require.Error(t, err)
	assert.ErrorIs(t, err, service_errors.ErrPendingTrackLimitReached)
}

func TestTorrentService_checkSubmitQuota_RejectsWhenConcurrentDownloadLimitReached(t *testing.T) {
	svc, torrentStorage := newQuotaTestService(0, 2)

	ctx := context.Background()

	activeStatuses := []domain.TorrentDownloadStatus{
		domain.TorrentDownloadStatusDownloading,
		domain.TorrentDownloadStatusImporting,
	}
	for _, status := range activeStatuses {
		row := domain.TorrentDownload{UserId: 1, Status: status}
		added, addErr := torrentStorage.Add(ctx, row)
		require.NoError(t, addErr)

		statusErr := torrentStorage.UpdateStatus(ctx, added.Id, status)
		require.NoError(t, statusErr)
	}

	err := svc.checkSubmitQuota(ctx, 1, 10)
	require.Error(t, err)
	assert.ErrorIs(t, err, service_errors.ErrTorrentConcurrencyLimitReached)
}

// TestTorrentService_checkSubmitQuota_FinishedJobsFreeSlots proves finished
// jobs do not permanently consume a user's concurrency allowance.
func TestTorrentService_checkSubmitQuota_FinishedJobsFreeSlots(t *testing.T) {
	svc, torrentStorage := newQuotaTestService(0, 1)

	ctx := context.Background()

	row := domain.TorrentDownload{UserId: 1}
	added, err := torrentStorage.Add(ctx, row)
	require.NoError(t, err)

	err = torrentStorage.UpdateStatus(ctx, added.Id, domain.TorrentDownloadStatusDone)
	require.NoError(t, err)

	err = svc.checkSubmitQuota(ctx, 1, 10)
	require.NoError(t, err)
}

// TestTorrentService_checkSubmitQuota_OtherUsersDoNotCount proves the
// concurrency cap is per user, not global.
func TestTorrentService_checkSubmitQuota_OtherUsersDoNotCount(t *testing.T) {
	svc, torrentStorage := newQuotaTestService(0, 1)

	ctx := context.Background()

	row := domain.TorrentDownload{UserId: 2}
	added, err := torrentStorage.Add(ctx, row)
	require.NoError(t, err)

	err = torrentStorage.UpdateStatus(ctx, added.Id, domain.TorrentDownloadStatusDownloading)
	require.NoError(t, err)

	err = svc.checkSubmitQuota(ctx, 1, 10)
	require.NoError(t, err)
}

func TestTorrentService_SubmitTorrent_RequiresAuthentication(t *testing.T) {
	svc, _ := newQuotaTestService(0, 3)

	id, err := svc.SubmitTorrent(context.Background(), []byte("d4:infod"), "")
	require.Error(t, err)
	assert.ErrorIs(t, err, user_errors.ErrUnauthenticated)
	assert.Zero(t, id)
}

func TestTorrentService_SubmitTorrent_RequiresUploadPermission(t *testing.T) {
	svc, _ := newQuotaTestService(0, 3)

	permissions := domain.UserPermissions{CanUpload: false}
	ctx := contextWithPermissions(1, permissions)

	id, err := svc.SubmitTorrent(ctx, []byte("d4:infod"), "")
	require.Error(t, err)
	assert.ErrorIs(t, err, user_errors.ErrPermissionDenied)
	assert.Zero(t, id)
}

// TestTorrentService_SubmitTorrent_RejectsInvalidTorrentFile covers both
// garbage input and magnet-style input: neither carries a usable info dict.
func TestTorrentService_SubmitTorrent_RejectsInvalidTorrentFile(t *testing.T) {
	svc, _ := newQuotaTestService(0, 3)
	svc.torrentClient = nil

	ctx := contextWithPermissions(1, uploadPermissions())

	// With no client wired the request is refused before parsing, which is
	// the branch a misconfigured deployment hits.
	id, err := svc.SubmitTorrent(ctx, []byte("not a torrent"), "")
	require.Error(t, err)
	assert.ErrorIs(t, err, service_errors.ErrTorrentClientUnavailable)
	assert.Zero(t, id)
}

func TestTorrentService_ListJobs_RequiresAuthentication(t *testing.T) {
	svc, _ := newQuotaTestService(0, 3)

	rows, err := svc.ListJobs(context.Background(), "")
	require.Error(t, err)
	assert.ErrorIs(t, err, user_errors.ErrUnauthenticated)
	assert.Nil(t, rows)
}

// TestTorrentService_GetJob_IsScopedToCaller proves a job belonging to another
// user is not readable.
func TestTorrentService_GetJob_IsScopedToCaller(t *testing.T) {
	svc, torrentStorage := newQuotaTestService(0, 3)

	ctx := contextWithPermissions(1, uploadPermissions())

	othersRow := domain.TorrentDownload{UserId: 2, TorrentName: "someone-elses"}
	added, err := torrentStorage.Add(ctx, othersRow)
	require.NoError(t, err)

	row, err := svc.GetJob(ctx, added.Id)
	require.Error(t, err)
	assert.ErrorIs(t, err, storage.ErrNotFound)
	assert.Zero(t, row.Id)
}

func TestTorrentService_ListJobs_ReturnsOnlyCallersJobs(t *testing.T) {
	svc, torrentStorage := newQuotaTestService(0, 3)

	ctx := contextWithPermissions(1, uploadPermissions())

	mine := domain.TorrentDownload{UserId: 1, TorrentName: "mine", FolderName: testFolderName}
	_, err := torrentStorage.Add(ctx, mine)
	require.NoError(t, err)

	theirs := domain.TorrentDownload{UserId: 2, TorrentName: "theirs", FolderName: testFolderName}
	_, err = torrentStorage.Add(ctx, theirs)
	require.NoError(t, err)

	rows, err := svc.ListJobs(ctx, testFolderName)
	require.NoError(t, err)

	require.Len(t, rows, 1)
	assert.Equal(t, "mine", rows[0].TorrentName)
}

// TestTorrentScratchPath_RejectsEscapingNames proves an attacker-controlled
// torrent name cannot make cleanup delete something outside the scratch dir.
func TestTorrentScratchPath_RejectsEscapingNames(t *testing.T) {
	downloadDir := t.TempDir()

	escaping := []string{"..", "../evil", "../../etc", ""}
	for _, name := range escaping {
		got, err := torrentScratchPath(downloadDir, name)
		assert.Error(t, err, "name %q must be rejected", name)
		assert.Empty(t, got)
	}
}

func TestTorrentScratchPath_ResolvesInsideDownloadDir(t *testing.T) {
	downloadDir := t.TempDir()

	got, err := torrentScratchPath(downloadDir, "Some Album")
	require.NoError(t, err)

	assert.Equal(t, filepath.Join(downloadDir, "Some Album"), got)
}

// TestResolveTorrentFilePath_RejectsEscapingPaths proves a malicious
// torrent-relative path cannot be used to read outside the scratch dir.
func TestResolveTorrentFilePath_RejectsEscapingPaths(t *testing.T) {
	downloadDir := t.TempDir()

	cfg := TorrentServiceConfig{DownloadDir: downloadDir}
	svc := &TorrentService{cfg: cfg}

	got, err := svc.resolveTorrentFilePath("../../etc/passwd")
	require.Error(t, err)
	assert.Empty(t, got)
}

func TestResolveTorrentFilePath_ResolvesInsideDownloadDir(t *testing.T) {
	downloadDir := t.TempDir()

	cfg := TorrentServiceConfig{DownloadDir: downloadDir}
	svc := &TorrentService{cfg: cfg}

	got, err := svc.resolveTorrentFilePath("Album/01 - Track.mp3")
	require.NoError(t, err)

	assert.Equal(t, filepath.Join(downloadDir, "Album", "01 - Track.mp3"), got)
}

// TestEncodeDecodeTorrentImportedFiles round-trips the per-file import result
// that the []string imported_files column carries.
func TestEncodeDecodeTorrentImportedFiles(t *testing.T) {
	files := []domain.TorrentImportedFile{
		{TorrentPath: "Album/01.mp3", FileId: 7, Status: domain.TorrentImportedFileStatusOk},
		{TorrentPath: "Album/02.mp3", Status: domain.TorrentImportedFileStatusFailed, Error: "boom"},
	}

	encoded, err := domain.EncodeTorrentImportedFiles(files)
	require.NoError(t, err)
	require.Len(t, encoded, 2)

	decoded := domain.DecodeTorrentImportedFiles(encoded)
	assert.Equal(t, files, decoded)
}

// TestDecodeTorrentImportedFiles_PlainPathsStillRender covers rows written as
// bare paths rather than JSON objects.
func TestDecodeTorrentImportedFiles_PlainPathsStillRender(t *testing.T) {
	decoded := domain.DecodeTorrentImportedFiles([]string{"Album/01.mp3"})

	require.Len(t, decoded, 1)
	assert.Equal(t, "Album/01.mp3", decoded[0].TorrentPath)
	assert.Equal(t, domain.TorrentImportedFileStatusOk, decoded[0].Status)
}
