package pg

import (
	"context"
	"database/sql"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

// torrentDownloadsTestDSN mirrors the dev Postgres connection settings in config/dev.yaml.
const torrentDownloadsTestDSN = "host=localhost port=15432 user=zpotify dbname=zpotify_db sslmode=disable"

// newTorrentDownloadsTestStore opens a transaction against the dev Postgres instance and
// returns a TorrentDownloadStorage bound to it. The transaction is always rolled back on
// test cleanup, so no test data is ever persisted. If the dev Postgres instance is not
// reachable the test is skipped rather than failed.
func newTorrentDownloadsTestStore(t *testing.T) storage.TorrentDownloadStorage {
	t.Helper()

	db, err := sql.Open("postgres", torrentDownloadsTestDSN)
	if err != nil {
		t.Skipf("skipping: cannot open connection to test postgres: %v", err)
	}

	err = db.PingContext(context.Background())
	if err != nil {
		t.Skipf("skipping: dev postgres at %q is not reachable: %v", torrentDownloadsTestDSN, err)
	}

	tx, err := db.Begin()
	require.NoError(t, err)

	t.Cleanup(func() {
		_ = tx.Rollback()
		_ = db.Close()
	})

	base := NewTorrentDownloadsStorage(db)
	store := base.WithTx(tx)

	return store
}

func newTestTorrentDownload(userId int64) domain.TorrentDownload {
	dl := domain.TorrentDownload{
		UserId:      userId,
		FolderName:  "my-folder",
		InfoHash:    uuid.New().String(),
		TorrentName: "some.torrent",
	}

	return dl
}

func TestTorrentDownloadsStorage_AddAndGet_RoundTrip(t *testing.T) {
	store := newTorrentDownloadsTestStore(t)
	ctx := context.Background()

	userId := int64(900001)
	dl := newTestTorrentDownload(userId)

	created, err := store.Add(ctx, dl)
	require.NoError(t, err)
	assert.NotZero(t, created.Id)
	assert.Equal(t, domain.TorrentDownloadStatusQueued, created.Status)
	assert.Equal(t, dl.InfoHash, created.InfoHash)
	assert.Equal(t, dl.FolderName, created.FolderName)
	assert.Empty(t, created.ImportedFiles)

	fetched, err := store.Get(ctx, created.Id, userId)
	require.NoError(t, err)
	assert.Equal(t, created, fetched)
}

func TestTorrentDownloadsStorage_Get_WrongUserNotFound(t *testing.T) {
	store := newTorrentDownloadsTestStore(t)
	ctx := context.Background()

	ownerId := int64(900002)
	otherUserId := int64(900003)
	dl := newTestTorrentDownload(ownerId)

	created, err := store.Add(ctx, dl)
	require.NoError(t, err)

	_, err = store.Get(ctx, created.Id, otherUserId)
	assert.ErrorIs(t, err, storage.ErrNotFound)
}

func TestTorrentDownloadsStorage_Add_UniqueUserInfoHash(t *testing.T) {
	store := newTorrentDownloadsTestStore(t)
	ctx := context.Background()

	userId := int64(900004)
	dl := newTestTorrentDownload(userId)

	_, err := store.Add(ctx, dl)
	require.NoError(t, err)

	_, err = store.Add(ctx, dl)
	require.Error(t, err)
	assert.ErrorIs(t, err, storage.ErrAlreadyExists)
}

func TestTorrentDownloadsStorage_ListActive_OnlyActiveStatuses(t *testing.T) {
	store := newTorrentDownloadsTestStore(t)
	ctx := context.Background()

	userId := int64(900005)

	allStatuses := []domain.TorrentDownloadStatus{
		domain.TorrentDownloadStatusQueued,
		domain.TorrentDownloadStatusDownloading,
		domain.TorrentDownloadStatusImporting,
		domain.TorrentDownloadStatusSeeding,
		domain.TorrentDownloadStatusDone,
		domain.TorrentDownloadStatusFailed,
		domain.TorrentDownloadStatusCanceled,
	}

	idsByStatus := make(map[domain.TorrentDownloadStatus]int64, len(allStatuses))
	for _, status := range allStatuses {
		dl := newTestTorrentDownload(userId)

		created, err := store.Add(ctx, dl)
		require.NoError(t, err)

		err = store.UpdateStatus(ctx, created.Id, status)
		require.NoError(t, err)

		idsByStatus[status] = created.Id
	}

	active, err := store.ListActive(ctx)
	require.NoError(t, err)

	activeIds := make(map[int64]bool, len(active))
	for _, dl := range active {
		activeIds[dl.Id] = true
	}

	activeStatusSet := make(map[domain.TorrentDownloadStatus]bool, len(domain.ActiveTorrentDownloadStatuses))
	for _, status := range domain.ActiveTorrentDownloadStatuses {
		activeStatusSet[status] = true
	}

	for _, status := range allStatuses {
		id := idsByStatus[status]
		if activeStatusSet[status] {
			assert.True(t, activeIds[id], "expected status %q to be listed as active", status)
		} else {
			assert.False(t, activeIds[id], "expected status %q to NOT be listed as active", status)
		}
	}
}

func TestTorrentDownloadsStorage_UpdateProgress(t *testing.T) {
	store := newTorrentDownloadsTestStore(t)
	ctx := context.Background()

	userId := int64(900006)
	dl := newTestTorrentDownload(userId)

	created, err := store.Add(ctx, dl)
	require.NoError(t, err)

	err = store.UpdateProgress(ctx, created.Id, 512, 1024)
	require.NoError(t, err)

	fetched, err := store.Get(ctx, created.Id, userId)
	require.NoError(t, err)
	assert.EqualValues(t, 512, fetched.DownloadedBytes)
	assert.EqualValues(t, 1024, fetched.TotalBytes)
}

func TestTorrentDownloadsStorage_UpdateStatus(t *testing.T) {
	store := newTorrentDownloadsTestStore(t)
	ctx := context.Background()

	userId := int64(900007)
	dl := newTestTorrentDownload(userId)

	created, err := store.Add(ctx, dl)
	require.NoError(t, err)
	require.Equal(t, domain.TorrentDownloadStatusQueued, created.Status)

	err = store.UpdateStatus(ctx, created.Id, domain.TorrentDownloadStatusSeeding)
	require.NoError(t, err)

	fetched, err := store.Get(ctx, created.Id, userId)
	require.NoError(t, err)
	assert.Equal(t, domain.TorrentDownloadStatusSeeding, fetched.Status)
}

func TestTorrentDownloadsStorage_SetError(t *testing.T) {
	store := newTorrentDownloadsTestStore(t)
	ctx := context.Background()

	userId := int64(900008)
	dl := newTestTorrentDownload(userId)

	created, err := store.Add(ctx, dl)
	require.NoError(t, err)

	err = store.SetError(ctx, created.Id, "boom")
	require.NoError(t, err)

	fetched, err := store.Get(ctx, created.Id, userId)
	require.NoError(t, err)
	assert.Equal(t, domain.TorrentDownloadStatusFailed, fetched.Status)
	assert.Equal(t, "boom", fetched.Error)
}

func TestTorrentDownloadsStorage_SetImportedFiles(t *testing.T) {
	store := newTorrentDownloadsTestStore(t)
	ctx := context.Background()

	userId := int64(900009)
	dl := newTestTorrentDownload(userId)

	created, err := store.Add(ctx, dl)
	require.NoError(t, err)

	files := []string{"a.mp3", "b/c.mp3"}

	err = store.SetImportedFiles(ctx, created.Id, files)
	require.NoError(t, err)

	fetched, err := store.Get(ctx, created.Id, userId)
	require.NoError(t, err)
	assert.Equal(t, files, fetched.ImportedFiles)
}

func TestTorrentDownloadsStorage_Delete_IsUserScoped(t *testing.T) {
	store := newTorrentDownloadsTestStore(t)
	ctx := context.Background()

	ownerId := int64(900010)
	otherUserId := int64(900011)

	dl := newTestTorrentDownload(ownerId)

	created, err := store.Add(ctx, dl)
	require.NoError(t, err)

	// A delete scoped to a different user must be a no-op.
	err = store.Delete(ctx, created.Id, otherUserId)
	require.NoError(t, err)

	fetched, err := store.Get(ctx, created.Id, ownerId)
	require.NoError(t, err)
	assert.Equal(t, created.Id, fetched.Id)

	// A delete scoped to the actual owner succeeds.
	err = store.Delete(ctx, created.Id, ownerId)
	require.NoError(t, err)

	_, err = store.Get(ctx, created.Id, ownerId)
	assert.ErrorIs(t, err, storage.ErrNotFound)
}

func TestTorrentDownloadsStorage_ListByUser_FiltersByFolder(t *testing.T) {
	store := newTorrentDownloadsTestStore(t)
	ctx := context.Background()

	userId := int64(900012)

	dlA := newTestTorrentDownload(userId)
	dlA.FolderName = "folder-a"
	_, err := store.Add(ctx, dlA)
	require.NoError(t, err)

	dlB := newTestTorrentDownload(userId)
	dlB.FolderName = "folder-b"
	_, err = store.Add(ctx, dlB)
	require.NoError(t, err)

	all, err := store.ListByUser(ctx, userId, "")
	require.NoError(t, err)
	assert.Len(t, all, 2)

	filtered, err := store.ListByUser(ctx, userId, "folder-a")
	require.NoError(t, err)
	require.Len(t, filtered, 1)
	assert.Equal(t, "folder-a", filtered[0].FolderName)
}
