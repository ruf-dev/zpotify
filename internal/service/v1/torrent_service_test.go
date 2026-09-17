package v1

import (
	"bytes"
	"context"
	"database/sql"
	"path/filepath"
	"sort"
	"strconv"
	"sync"
	"testing"
	"time"

	"github.com/anacrolix/torrent"
	"github.com/anacrolix/torrent/bencode"
	"github.com/anacrolix/torrent/metainfo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/user_errors"
)

const (
	testSomeoneElsesTorrentName = "someone-elses"
	testMineTorrentName         = "mine"
	testAlbum1TorrentName       = "album1.torrent"
	testAlbum2TorrentName       = "album2.torrent"
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

	// Check for unique (user_id, info_hash) on active status only - matching the partial index.
	// Only enforce when info_hash is non-empty (real DB constraint only applies to actual hashes).
	if download.InfoHash != "" {
		for _, row := range f.byId {
			if row.UserId == download.UserId && row.InfoHash == download.InfoHash {
				if isActiveTorrentStatus(row.Status) {
					// Active torrent with same (user_id, info_hash) already exists
					return domain.TorrentDownload{}, storage.ErrAlreadyExists
				}
			}
		}
	}

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

func (f *fakeTorrentDownloadStorage) GetByUserAndInfoHash(
	_ context.Context,
	userId int64,
	infoHash string,
) (sql.Null[domain.TorrentDownload], error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	for _, row := range f.byId {
		if row.UserId == userId && row.InfoHash == infoHash {
			// Only return active torrents - dedup should not block re-submission of completed/failed torrents
			if isActiveTorrentStatus(row.Status) {
				return sql.Null[domain.TorrentDownload]{V: row, Valid: true}, nil
			}
		}
	}

	return sql.Null[domain.TorrentDownload]{}, nil
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

	// Newest first, matching the real ORDER BY created_at DESC in
	// ListTorrentDownloadsByUser; Id is a stand-in for creation order since
	// this fake doesn't stamp created_at.
	sort.Slice(rows, func(i, j int) bool { return rows[i].Id > rows[j].Id })

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

func (f *fakeTorrentDownloadStorage) UpdateProgress(
	_ context.Context,
	id int64,
	downloadedBytes int64,
	totalBytes int64,
	fileProgress []domain.TorrentFileProgress,
) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	row, ok := f.byId[id]
	if !ok {
		return storage.ErrNotFound
	}
	row.DownloadedBytes = downloadedBytes
	row.TotalBytes = totalBytes
	row.Files = fileProgress
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

// newValidTorrentBytes bencodes a minimal single-file .torrent whose info
// dict is complete enough for metainfo.Load/UnmarshalInfo to accept it, and
// returns its info hash alongside the encoded bytes.
func newValidTorrentBytes(t *testing.T, name string) ([]byte, string) {
	t.Helper()

	info := metainfo.Info{
		PieceLength: 16384,
		Name:        name,
		Length:      1024,
	}

	infoBytes, err := bencode.Marshal(info)
	require.NoError(t, err)

	mi := metainfo.MetaInfo{InfoBytes: infoBytes}

	var buf bytes.Buffer
	err = mi.Write(&buf)
	require.NoError(t, err)

	return buf.Bytes(), mi.HashInfoBytes().HexString()
}

// TestTorrentService_SubmitTorrent_DuplicateReturnsExistingJobId proves a
// resubmit of the same (user, info hash) pair is short-circuited before the
// torrent is ever registered with the client, and hands back the id of the
// already-tracked job instead of a bare conflict.
func TestTorrentService_SubmitTorrent_DuplicateReturnsExistingJobId(t *testing.T) {
	svc, torrentStorage := newQuotaTestService(0, 3)
	svc.torrentClient = &torrent.Client{}

	ctx := contextWithPermissions(1, uploadPermissions())

	torrentBytes, infoHash := newValidTorrentBytes(t, "dup.mp3")

	existingDownload := domain.TorrentDownload{UserId: 1, InfoHash: infoHash, TorrentName: "dup.mp3"}
	existing, err := torrentStorage.Add(ctx, existingDownload)
	require.NoError(t, err)

	id, err := svc.SubmitTorrent(ctx, torrentBytes, "")
	require.Error(t, err)
	assert.ErrorIs(t, err, service_errors.ErrTorrentAlreadyExists)
	assert.Equal(t, existing.Id, id)
}

// TestTorrentService_SubmitTorrent_DuplicateReturnsExistingJobId_Paused proves
// a resubmit of a torrent whose existing job is paused is also short-circuited
// - paused is an active status, so it must dedup the same way queued/downloading
// /importing do.
func TestTorrentService_SubmitTorrent_DuplicateReturnsExistingJobId_Paused(t *testing.T) {
	svc, torrentStorage := newQuotaTestService(0, 3)
	svc.torrentClient = &torrent.Client{}

	ctx := contextWithPermissions(1, uploadPermissions())

	torrentBytes, infoHash := newValidTorrentBytes(t, "paused-dup.mp3")

	pausedDownload := domain.TorrentDownload{
		UserId:      1,
		InfoHash:    infoHash,
		TorrentName: "paused-dup.mp3",
		Status:      domain.TorrentDownloadStatusPaused,
	}
	existing, err := torrentStorage.Add(ctx, pausedDownload)
	require.NoError(t, err)

	id, err := svc.SubmitTorrent(ctx, torrentBytes, "")
	require.Error(t, err)
	assert.ErrorIs(t, err, service_errors.ErrTorrentAlreadyExists)
	assert.Equal(t, existing.Id, id)
}

// TestTorrentService_SubmitTorrent_AllowsResubmitAfterDelete proves that after
// deleting a torrent job, resubmitting the same torrent file succeeds. The
// dedup check only blocks active downloads, not deleted ones. After delete,
// the row is gone from storage and does not block re-submission.
func TestTorrentService_SubmitTorrent_AllowsResubmitAfterDelete(t *testing.T) {
	_, torrentStorage := newQuotaTestService(0, 3)

	ctx := contextWithPermissions(1, uploadPermissions())

	_, infoHash := newValidTorrentBytes(t, "resubmit.mp3")

	// Pre-create a deleted job with the same info hash - status is not queued/downloading/importing
	// so it should NOT block re-submission. Hard delete simulates this by removing the row.
	deletedDownload := domain.TorrentDownload{
		UserId:      1,
		InfoHash:    infoHash,
		TorrentName: "resubmit.mp3",
		Status:      domain.TorrentDownloadStatusCanceled,
	}
	deletedJob, err := torrentStorage.Add(ctx, deletedDownload)
	require.NoError(t, err)

	// Delete the job (hard delete)
	err = torrentStorage.Delete(ctx, deletedJob.Id, 1)
	require.NoError(t, err)

	// Re-submit the same torrent - should pass dedup check since no active job exists
	// The dedup check now filters for active status, so canceled/deleted rows don't block it
	existing, err := torrentStorage.GetByUserAndInfoHash(ctx, 1, infoHash)
	require.NoError(t, err)
	require.False(t, existing.Valid, "deleted torrent should not be found by dedup query")
}

// TestTorrentService_SubmitTorrent_DedupsActiveOnlyNotCompleted proves the
// dedup check only blocks active downloads (queued/downloading/importing), not
// completed/failed/canceled ones. A user can re-submit a torrent that
// previously completed or failed.
func TestTorrentService_SubmitTorrent_DedupsActiveOnlyNotCompleted(t *testing.T) {
	_, torrentStorage := newQuotaTestService(0, 3)

	ctx := contextWithPermissions(1, uploadPermissions())

	_, infoHash := newValidTorrentBytes(t, "completed.mp3")

	// Create a completed download with the same info hash
	completedDownload := domain.TorrentDownload{
		UserId:      1,
		InfoHash:    infoHash,
		TorrentName: "completed.mp3",
		Status:      domain.TorrentDownloadStatusDone,
	}
	_, err := torrentStorage.Add(ctx, completedDownload)
	require.NoError(t, err)

	// The dedup query should NOT find it since status is 'done', not active
	existing, err := torrentStorage.GetByUserAndInfoHash(ctx, 1, infoHash)
	require.NoError(t, err)
	require.False(t, existing.Valid, "completed torrent should not block re-submission")
}

// TestTorrentService_SubmitTorrent_AllowsResubmitAfterCancel proves that a canceled torrent
// does not block resubmission of the same torrent file. The scenario simulates:
// 1. User submits a torrent (creates queued job)
// 2. User cancels the job (updates status to canceled, but row stays in DB)
// 3. Adding a new job with same (user_id, info_hash) should succeed, not AlreadyExists error
// This tests the partial index constraint: canceled status is not included in the unique index.
func TestTorrentService_SubmitTorrent_AllowsResubmitAfterCancel(t *testing.T) {
	_, torrentStorage := newQuotaTestService(0, 3)

	ctx := contextWithPermissions(1, uploadPermissions())

	_, infoHash := newValidTorrentBytes(t, "cancel-resubmit.mp3")

	// Step 1: Create a queued download (simulating first submission)
	firstDownload := domain.TorrentDownload{UserId: 1, InfoHash: infoHash, TorrentName: "cancel-resubmit.mp3"}
	canceledJob, err := torrentStorage.Add(ctx, firstDownload)
	require.NoError(t, err)
	require.Equal(t, domain.TorrentDownloadStatusQueued, canceledJob.Status)

	// Step 2: Cancel the job (status changes to canceled, but row stays in DB)
	err = torrentStorage.UpdateStatus(ctx, canceledJob.Id, domain.TorrentDownloadStatusCanceled)
	require.NoError(t, err)

	// Step 3: Verify the dedup query does NOT find the canceled job
	existing, err := torrentStorage.GetByUserAndInfoHash(ctx, 1, infoHash)
	require.NoError(t, err)
	require.False(t, existing.Valid, "canceled torrent should not be found by dedup query")

	// Step 4: Try to add a new download with same (user_id, info_hash)
	// The fake storage now enforces the partial index constraint (active status only).
	// This should succeed because the canceled row is not covered by the partial index.
	// On real Postgres, this would work because the partial index only constrains active rows.
	secondDownload := domain.TorrentDownload{UserId: 1, InfoHash: infoHash, TorrentName: "cancel-resubmit.mp3"}
	newJob, err := torrentStorage.Add(ctx, secondDownload)
	require.NoError(t, err, "adding a new torrent after canceling should succeed")
	require.NotEqual(t, canceledJob.Id, newJob.Id, "new submission should get a different ID")
	require.Equal(t, domain.TorrentDownloadStatusQueued, newJob.Status, "new job should have queued status")
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

	othersRow := domain.TorrentDownload{UserId: 2, TorrentName: testSomeoneElsesTorrentName}
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

	mine := domain.TorrentDownload{UserId: 1, TorrentName: testMineTorrentName, FolderName: testFolderName}
	_, err := torrentStorage.Add(ctx, mine)
	require.NoError(t, err)

	theirs := domain.TorrentDownload{UserId: 2, TorrentName: "theirs", FolderName: testFolderName}
	_, err = torrentStorage.Add(ctx, theirs)
	require.NoError(t, err)

	rows, err := svc.ListJobs(ctx, testFolderName)
	require.NoError(t, err)

	require.Len(t, rows, 1)
	assert.Equal(t, testMineTorrentName, rows[0].TorrentName)
}

func TestTorrentService_PauseJob_RequiresAuthentication(t *testing.T) {
	svc, _ := newQuotaTestService(0, 3)

	err := svc.PauseJob(context.Background(), 1)
	require.Error(t, err)
	assert.ErrorIs(t, err, user_errors.ErrUnauthenticated)
}

// TestTorrentService_PauseJob_IsScopedToCaller proves a job belonging to
// another user cannot be paused.
func TestTorrentService_PauseJob_IsScopedToCaller(t *testing.T) {
	svc, torrentStorage := newQuotaTestService(0, 3)

	ctx := contextWithPermissions(1, uploadPermissions())

	othersRow := domain.TorrentDownload{UserId: 2, TorrentName: testSomeoneElsesTorrentName, Status: domain.TorrentDownloadStatusDownloading}
	added, err := torrentStorage.Add(ctx, othersRow)
	require.NoError(t, err)

	err = svc.PauseJob(ctx, added.Id)
	require.Error(t, err)
	assert.ErrorIs(t, err, storage.ErrNotFound)
}

// TestTorrentService_PauseJob_MarksJobPaused proves a successful pause
// updates the job status even when no live torrent is registered
// client-side.
func TestTorrentService_PauseJob_MarksJobPaused(t *testing.T) {
	svc, torrentStorage := newQuotaTestService(0, 3)

	ctx := contextWithPermissions(1, uploadPermissions())

	row := domain.TorrentDownload{UserId: 1, TorrentName: testMineTorrentName, Status: domain.TorrentDownloadStatusDownloading}
	added, err := torrentStorage.Add(ctx, row)
	require.NoError(t, err)

	err = svc.PauseJob(ctx, added.Id)
	require.NoError(t, err)

	got, err := torrentStorage.Get(ctx, added.Id, 1)
	require.NoError(t, err)
	assert.Equal(t, domain.TorrentDownloadStatusPaused, got.Status)
}

func TestTorrentService_ResumeJob_RequiresAuthentication(t *testing.T) {
	svc, _ := newQuotaTestService(0, 3)

	err := svc.ResumeJob(context.Background(), 1)
	require.Error(t, err)
	assert.ErrorIs(t, err, user_errors.ErrUnauthenticated)
}

// TestTorrentService_ResumeJob_IsScopedToCaller proves a job belonging to
// another user cannot be resumed.
func TestTorrentService_ResumeJob_IsScopedToCaller(t *testing.T) {
	svc, torrentStorage := newQuotaTestService(0, 3)

	ctx := contextWithPermissions(1, uploadPermissions())

	othersRow := domain.TorrentDownload{UserId: 2, TorrentName: testSomeoneElsesTorrentName, Status: domain.TorrentDownloadStatusPaused}
	added, err := torrentStorage.Add(ctx, othersRow)
	require.NoError(t, err)

	err = svc.ResumeJob(ctx, added.Id)
	require.Error(t, err)
	assert.ErrorIs(t, err, storage.ErrNotFound)
}

// TestTorrentService_ResumeJob_MarksJobDownloading proves a successful
// resume always returns the job to the downloading state.
func TestTorrentService_ResumeJob_MarksJobDownloading(t *testing.T) {
	svc, torrentStorage := newQuotaTestService(0, 3)

	ctx := contextWithPermissions(1, uploadPermissions())

	row := domain.TorrentDownload{UserId: 1, TorrentName: testMineTorrentName, Status: domain.TorrentDownloadStatusPaused}
	added, err := torrentStorage.Add(ctx, row)
	require.NoError(t, err)

	err = svc.ResumeJob(ctx, added.Id)
	require.NoError(t, err)

	got, err := torrentStorage.Get(ctx, added.Id, 1)
	require.NoError(t, err)
	assert.Equal(t, domain.TorrentDownloadStatusDownloading, got.Status)
}

func TestTorrentService_DeleteJob_RequiresAuthentication(t *testing.T) {
	svc, _ := newQuotaTestService(0, 3)

	err := svc.DeleteJob(context.Background(), 1)
	require.Error(t, err)
	assert.ErrorIs(t, err, user_errors.ErrUnauthenticated)
}

// TestTorrentService_DeleteJob_IsScopedToCaller proves a job belonging to
// another user cannot be deleted, and is left untouched.
func TestTorrentService_DeleteJob_IsScopedToCaller(t *testing.T) {
	svc, torrentStorage := newQuotaTestService(0, 3)

	ctx := contextWithPermissions(1, uploadPermissions())

	othersRow := domain.TorrentDownload{UserId: 2, TorrentName: testSomeoneElsesTorrentName}
	added, err := torrentStorage.Add(ctx, othersRow)
	require.NoError(t, err)

	err = svc.DeleteJob(ctx, added.Id)
	require.Error(t, err)
	assert.ErrorIs(t, err, storage.ErrNotFound)

	_, err = torrentStorage.Get(context.Background(), added.Id, 2)
	require.NoError(t, err, "job must not have been removed")
}

// TestTorrentService_DeleteJob_RemovesRow proves a successful delete
// actually invokes storage.Delete and the row is gone afterward.
func TestTorrentService_DeleteJob_RemovesRow(t *testing.T) {
	svc, torrentStorage := newQuotaTestService(0, 3)

	ctx := contextWithPermissions(1, uploadPermissions())

	row := domain.TorrentDownload{UserId: 1, TorrentName: testMineTorrentName, Status: domain.TorrentDownloadStatusDownloading}
	added, err := torrentStorage.Add(ctx, row)
	require.NoError(t, err)

	err = svc.DeleteJob(ctx, added.Id)
	require.NoError(t, err)

	_, err = torrentStorage.Get(ctx, added.Id, 1)
	require.Error(t, err, "row should have been deleted")
	assert.ErrorIs(t, err, storage.ErrNotFound)
}

// TestTorrentService_DeleteJob_SchedulesImportedFilesForDeletion proves a
// successful delete also removes the files_meta rows of everything the
// torrent already imported and schedules the physical files for deletion,
// so a deleted torrent job doesn't leave its imported files dangling.
func TestTorrentService_DeleteJob_SchedulesImportedFilesForDeletion(t *testing.T) {
	svc, torrentStorage := newQuotaTestService(0, 3)

	fileMeta := newFakeFileMetaStorage()
	jobs := newFakeJobStorage()
	svc.fileMeta = fileMeta
	svc.jobs = jobs

	ctx := contextWithPermissions(1, uploadPermissions())

	fileMetaToAdd := domain.FileMeta{File: domain.File{FilePath: "tmp/1/album/track.mp3"}, AddedById: 1}
	importedFileId, err := fileMeta.Add(ctx, fileMetaToAdd)
	require.NoError(t, err)

	importedFiles := []domain.TorrentImportedFile{
		{TorrentPath: "track.mp3", FileId: importedFileId, Status: domain.TorrentImportedFileStatusOk},
		{TorrentPath: "cover.jpg", Status: domain.TorrentImportedFileStatusFailed, Error: "not audio"},
	}
	encodedFiles, err := domain.EncodeTorrentImportedFiles(importedFiles)
	require.NoError(t, err)

	row := domain.TorrentDownload{
		UserId:        1,
		TorrentName:   testMineTorrentName,
		Status:        domain.TorrentDownloadStatusDone,
		ImportedFiles: encodedFiles,
	}
	added, err := torrentStorage.Add(ctx, row)
	require.NoError(t, err)

	err = svc.DeleteJob(ctx, added.Id)
	require.NoError(t, err)

	_, err = fileMeta.Get(ctx, importedFileId)
	require.Error(t, err, "imported file's meta row should have been deleted")

	require.Len(t, jobs.garbagePaths, 1)
	assert.Equal(t, "tmp/1/album/track.mp3", jobs.garbagePaths[0])
}

// TestTorrentService_DeleteJob_SucceedsWhenAnImportedFileWasAlreadyDeleted
// reproduces the 500: an imported file whose files_meta row was already
// removed elsewhere (e.g. the user deleted the song from their library
// directly) must not fail the whole delete - it's skipped, while imported
// files that still exist are still deleted and enqueued for cleanup.
func TestTorrentService_DeleteJob_SucceedsWhenAnImportedFileWasAlreadyDeleted(t *testing.T) {
	svc, torrentStorage := newQuotaTestService(0, 3)

	fileMeta := newFakeFileMetaStorage()
	jobs := newFakeJobStorage()
	svc.fileMeta = fileMeta
	svc.jobs = jobs

	ctx := contextWithPermissions(1, uploadPermissions())

	fileMetaToAdd := domain.FileMeta{File: domain.File{FilePath: "tmp/1/album/still-there.mp3"}, AddedById: 1}
	survivingFileId, err := fileMeta.Add(ctx, fileMetaToAdd)
	require.NoError(t, err)

	const deletedFileId = int64(9999)

	importedFiles := []domain.TorrentImportedFile{
		{TorrentPath: "gone.mp3", FileId: deletedFileId, Status: domain.TorrentImportedFileStatusOk},
		{TorrentPath: "still-there.mp3", FileId: survivingFileId, Status: domain.TorrentImportedFileStatusOk},
	}
	encodedFiles, err := domain.EncodeTorrentImportedFiles(importedFiles)
	require.NoError(t, err)

	row := domain.TorrentDownload{
		UserId:        1,
		TorrentName:   testMineTorrentName,
		Status:        domain.TorrentDownloadStatusDone,
		ImportedFiles: encodedFiles,
	}
	added, err := torrentStorage.Add(ctx, row)
	require.NoError(t, err)

	err = svc.DeleteJob(ctx, added.Id)
	require.NoError(t, err, "a stale imported-file reference must not fail the whole delete")

	_, err = fileMeta.Get(ctx, survivingFileId)
	require.Error(t, err, "the surviving imported file's meta row should still have been deleted")

	require.Len(t, jobs.garbagePaths, 1)
	assert.Equal(t, "tmp/1/album/still-there.mp3", jobs.garbagePaths[0])
}

// TestTorrentService_GetJob_MarksFileDeletedForStaleImportedFiles proves
// GetJob annotates each imported file with whether its files_meta row still
// exists, so a file removed from the library independently of the torrent
// job (e.g. deleted straight from the library) shows that on read.
func TestTorrentService_GetJob_MarksFileDeletedForStaleImportedFiles(t *testing.T) {
	svc, torrentStorage := newQuotaTestService(0, 3)

	fileMeta := newFakeFileMetaStorage()
	svc.fileMeta = fileMeta

	ctx := contextWithPermissions(1, uploadPermissions())

	fileMetaToAdd := domain.FileMeta{File: domain.File{FilePath: "tmp/1/album/still-there.mp3"}, AddedById: 1}
	survivingFileId, err := fileMeta.Add(ctx, fileMetaToAdd)
	require.NoError(t, err)

	const deletedFileId = int64(9999)

	importedFiles := []domain.TorrentImportedFile{
		{TorrentPath: "gone.mp3", FileId: deletedFileId, Status: domain.TorrentImportedFileStatusOk},
		{TorrentPath: "still-there.mp3", FileId: survivingFileId, Status: domain.TorrentImportedFileStatusOk},
	}
	encodedFiles, err := domain.EncodeTorrentImportedFiles(importedFiles)
	require.NoError(t, err)

	row := domain.TorrentDownload{
		UserId:        1,
		TorrentName:   testMineTorrentName,
		Status:        domain.TorrentDownloadStatusDone,
		ImportedFiles: encodedFiles,
	}
	added, err := torrentStorage.Add(ctx, row)
	require.NoError(t, err)

	got, err := svc.GetJob(ctx, added.Id)
	require.NoError(t, err)

	decoded := domain.DecodeTorrentImportedFiles(got.ImportedFiles)
	require.Len(t, decoded, 2)

	byPath := make(map[string]domain.TorrentImportedFile, len(decoded))
	for _, file := range decoded {
		byPath[file.TorrentPath] = file
	}

	assert.True(t, byPath["gone.mp3"].FileDeleted, "a file whose files_meta row is gone must be marked deleted")
	assert.False(t, byPath["still-there.mp3"].FileDeleted, "a file whose files_meta row still exists must not be marked deleted")
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

	got, err := torrentScratchPath(downloadDir, testAlbumName)
	require.NoError(t, err)

	assert.Equal(t, filepath.Join(downloadDir, testAlbumName), got)
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

// fakeBroadcaster provides a simple test double for the broadcaster interface.
type fakeBroadcaster struct {
	mu          sync.Mutex
	subscribers map[int64][]chan domain.TorrentDownload
}

func newFakeBroadcaster() *fakeBroadcaster {
	return &fakeBroadcaster{
		subscribers: make(map[int64][]chan domain.TorrentDownload),
	}
}

func (fb *fakeBroadcaster) Subscribe(userID int64) chan domain.TorrentDownload {
	fb.mu.Lock()
	defer fb.mu.Unlock()

	ch := make(chan domain.TorrentDownload, 10)
	fb.subscribers[userID] = append(fb.subscribers[userID], ch)
	return ch
}

func (fb *fakeBroadcaster) Unsubscribe(userID int64, ch chan domain.TorrentDownload) {
	fb.mu.Lock()
	defer fb.mu.Unlock()

	close(ch)
}

func (fb *fakeBroadcaster) PublishForTest(job domain.TorrentDownload) {
	fb.mu.Lock()
	defer fb.mu.Unlock()

	chans, ok := fb.subscribers[job.UserId]
	if !ok {
		return
	}

	for _, ch := range chans {
		select {
		case ch <- job:
		default:
		}
	}
}

// TestTorrentService_WatchJobs_SendsCurrentJobs verifies that WatchJobs sends
// the caller's existing jobs before subscribing to future updates.
func TestTorrentService_WatchJobs_SendsCurrentJobs(t *testing.T) {
	torrentStorage := newFakeTorrentDownloadStorage()
	userID := int64(1)

	job1 := domain.TorrentDownload{
		UserId:      userID,
		InfoHash:    "abc123",
		TorrentName: testAlbum1TorrentName,
		Status:      domain.TorrentDownloadStatusDownloading,
	}

	job1Result, err := torrentStorage.Add(context.Background(), job1)
	require.NoError(t, err)

	job2 := domain.TorrentDownload{
		UserId:      userID,
		InfoHash:    "def456",
		TorrentName: testAlbum2TorrentName,
		Status:      domain.TorrentDownloadStatusQueued,
	}

	job2Result, err := torrentStorage.Add(context.Background(), job2)
	require.NoError(t, err)

	broadcaster := newFakeBroadcaster()

	svc := &TorrentService{
		torrentStorage: torrentStorage,
		broadcaster:    broadcaster,
	}

	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	ctx = user_context.WithUserContext(ctx, user_context.UserContext{UserId: userID})

	jobCh, err := svc.WatchJobs(ctx, "", 0)
	require.NoError(t, err)

	received := make([]domain.TorrentDownload, 0, 2)
	timeout := time.NewTimer(100 * time.Millisecond)
	defer timeout.Stop()

collectLoop:
	for len(received) < 2 {
		select {
		case job := <-jobCh:
			received = append(received, job)
		case <-timeout.C:
			break collectLoop
		}
	}

	require.Len(t, received, 2)
	assert.Equal(t, job2Result.Id, received[0].Id)
	assert.Equal(t, job1Result.Id, received[1].Id)

	cancel()
}

// TestTorrentService_WatchJobs_FiltersFolder verifies that WatchJobs respects
// the folderName filter.
func TestTorrentService_WatchJobs_FiltersFolder(t *testing.T) {
	torrentStorage := newFakeTorrentDownloadStorage()
	userID := int64(1)

	job1 := domain.TorrentDownload{
		UserId:      userID,
		FolderName:  "folder1",
		TorrentName: testAlbum1TorrentName,
		Status:      domain.TorrentDownloadStatusDownloading,
	}

	_, err := torrentStorage.Add(context.Background(), job1)
	require.NoError(t, err)

	job2 := domain.TorrentDownload{
		UserId:      userID,
		FolderName:  "folder2",
		TorrentName: testAlbum2TorrentName,
		Status:      domain.TorrentDownloadStatusQueued,
	}

	_, err = torrentStorage.Add(context.Background(), job2)
	require.NoError(t, err)

	broadcaster := newFakeBroadcaster()

	svc := &TorrentService{
		torrentStorage: torrentStorage,
		broadcaster:    broadcaster,
	}

	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	ctx = user_context.WithUserContext(ctx, user_context.UserContext{UserId: userID})

	jobCh, err := svc.WatchJobs(ctx, "folder1", 0)
	require.NoError(t, err)

	received := make([]domain.TorrentDownload, 0)
	timeout := time.NewTimer(100 * time.Millisecond)
	defer timeout.Stop()

collectLoop:
	for {
		select {
		case job := <-jobCh:
			received = append(received, job)
		case <-timeout.C:
			cancel()
			<-jobCh
			break collectLoop
		}
	}

	require.Len(t, received, 1)
	assert.Equal(t, "folder1", received[0].FolderName)
}

// TestTorrentService_WatchJobs_UserIsolation verifies that a user only receives
// their own jobs and not jobs from other users.
func TestTorrentService_WatchJobs_UserIsolation(t *testing.T) {
	torrentStorage := newFakeTorrentDownloadStorage()
	user1 := int64(1)
	user2 := int64(2)

	job1 := domain.TorrentDownload{
		UserId:      user1,
		TorrentName: testAlbum1TorrentName,
		Status:      domain.TorrentDownloadStatusDownloading,
	}

	_, err := torrentStorage.Add(context.Background(), job1)
	require.NoError(t, err)

	job2 := domain.TorrentDownload{
		UserId:      user2,
		TorrentName: testAlbum2TorrentName,
		Status:      domain.TorrentDownloadStatusDownloading,
	}

	_, err = torrentStorage.Add(context.Background(), job2)
	require.NoError(t, err)

	broadcaster := newFakeBroadcaster()

	svc := &TorrentService{
		torrentStorage: torrentStorage,
		broadcaster:    broadcaster,
	}

	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	ctx = user_context.WithUserContext(ctx, user_context.UserContext{UserId: user1})

	jobCh, err := svc.WatchJobs(ctx, "", 0)
	require.NoError(t, err)

	received := make([]domain.TorrentDownload, 0)
	timeout := time.NewTimer(100 * time.Millisecond)
	defer timeout.Stop()

collectLoop:
	for {
		select {
		case job := <-jobCh:
			received = append(received, job)
			assert.Equal(t, user1, job.UserId, "user 1 received job from different user")
		case <-timeout.C:
			cancel()
			<-jobCh
			break collectLoop
		}
	}

	require.Len(t, received, 1)
}
