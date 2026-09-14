package v1

import (
	"context"
	"testing"
	"time"

	"github.com/anacrolix/torrent"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/user_errors"
)

const (
	testPendingUploadId       = "abc"
	testPendingUploadFilePath = "TestAlbum/track.flac"
)

// newPendingUploadTestService builds a TorrentService with a single pending
// upload seeded directly into the cache under testPendingUploadId, so
// GetTorrentFile/SubmitTorrentFile ownership and expiry checks can be
// exercised without a real .torrent upload.
func newPendingUploadTestService(pending pendingTorrentUpload) *TorrentService {
	svc := &TorrentService{
		torrentStorage: newFakeTorrentDownloadStorage(),
		binaryStorage:  newFakePendingBinaryStorage(0),
		torrentClient:  &torrent.Client{},
		pendingUploads: map[string]pendingTorrentUpload{testPendingUploadId: pending},
	}

	return svc
}

func validPendingUpload() pendingTorrentUpload {
	return pendingTorrentUpload{
		userId:      1,
		infoHash:    "deadbeef",
		torrentName: "Album",
		files: []domain.TorrentFileEntry{
			{Path: testPendingUploadFilePath, SizeBytes: 100, Supported: true},
		},
		expiresAt: time.Now().Add(pendingTorrentUploadTTL),
	}
}

func TestTorrentService_GetTorrentFile_RequiresAuthentication(t *testing.T) {
	svc := newPendingUploadTestService(validPendingUpload())

	file, err := svc.GetTorrentFile(context.Background(), testPendingUploadId)
	require.Error(t, err)
	assert.ErrorIs(t, err, user_errors.ErrUnauthenticated)
	assert.Zero(t, file)
}

// TestTorrentService_GetTorrentFile_ReturnsCachedEntry proves a valid,
// caller-owned handle is a pure cache read of what UploadTorrentFile stored.
func TestTorrentService_GetTorrentFile_ReturnsCachedEntry(t *testing.T) {
	pending := validPendingUpload()
	svc := newPendingUploadTestService(pending)

	ctx := contextWithPermissions(1, uploadPermissions())

	file, err := svc.GetTorrentFile(ctx, testPendingUploadId)
	require.NoError(t, err)
	assert.Equal(t, testPendingUploadId, file.Id)
	assert.Equal(t, pending.torrentName, file.TorrentName)
	assert.Equal(t, pending.files, file.Files)
}

// TestTorrentService_GetTorrentFile_UnknownHandleNotFound proves an id that
// was never uploaded is reported as not found.
func TestTorrentService_GetTorrentFile_UnknownHandleNotFound(t *testing.T) {
	svc := newPendingUploadTestService(validPendingUpload())

	ctx := contextWithPermissions(1, uploadPermissions())

	file, err := svc.GetTorrentFile(ctx, "does-not-exist")
	require.Error(t, err)
	assert.ErrorIs(t, err, service_errors.ErrTorrentUploadNotFound)
	assert.Zero(t, file)
}

// TestTorrentService_GetTorrentFile_WrongOwnerNotFound proves a handle
// belonging to another user is reported as not found, not as a permission
// error - it must not leak that the id exists.
func TestTorrentService_GetTorrentFile_WrongOwnerNotFound(t *testing.T) {
	pending := validPendingUpload()
	pending.userId = 2
	svc := newPendingUploadTestService(pending)

	ctx := contextWithPermissions(1, uploadPermissions())

	file, err := svc.GetTorrentFile(ctx, testPendingUploadId)
	require.Error(t, err)
	assert.ErrorIs(t, err, service_errors.ErrTorrentUploadNotFound)
	assert.Zero(t, file)
}

// TestTorrentService_GetTorrentFile_ExpiredNotFound proves a handle past its
// TTL is reported as not found and removed from the cache.
func TestTorrentService_GetTorrentFile_ExpiredNotFound(t *testing.T) {
	pending := validPendingUpload()
	pending.expiresAt = time.Now().Add(-time.Minute)
	svc := newPendingUploadTestService(pending)

	ctx := contextWithPermissions(1, uploadPermissions())

	file, err := svc.GetTorrentFile(ctx, testPendingUploadId)
	require.Error(t, err)
	assert.ErrorIs(t, err, service_errors.ErrTorrentUploadNotFound)
	assert.Zero(t, file)

	_, stillCached := svc.pendingUploads[testPendingUploadId]
	assert.False(t, stillCached, "expired entry should be swept on lookup")
}

// TestTorrentService_GetTorrentFile_DoesNotConsumeEntry proves the caller can
// list a pending upload's files more than once while deciding what to submit.
func TestTorrentService_GetTorrentFile_DoesNotConsumeEntry(t *testing.T) {
	svc := newPendingUploadTestService(validPendingUpload())

	ctx := contextWithPermissions(1, uploadPermissions())

	_, err := svc.GetTorrentFile(ctx, testPendingUploadId)
	require.NoError(t, err)

	_, err = svc.GetTorrentFile(ctx, testPendingUploadId)
	require.NoError(t, err, "a second read of the same handle should still succeed")
}

func TestTorrentService_SubmitTorrentFile_RequiresAuthentication(t *testing.T) {
	svc := newPendingUploadTestService(validPendingUpload())

	jobId, err := svc.SubmitTorrentFile(context.Background(), testPendingUploadId, "", nil)
	require.Error(t, err)
	assert.ErrorIs(t, err, user_errors.ErrUnauthenticated)
	assert.Zero(t, jobId)
}

// TestTorrentService_SubmitTorrentFile_UnknownHandleNotFound proves an id
// that was never uploaded (or already submitted once) is rejected as not
// found rather than reaching the torrent client.
func TestTorrentService_SubmitTorrentFile_UnknownHandleNotFound(t *testing.T) {
	svc := newPendingUploadTestService(validPendingUpload())

	ctx := contextWithPermissions(1, uploadPermissions())

	jobId, err := svc.SubmitTorrentFile(ctx, "does-not-exist", "", []string{testPendingUploadFilePath})
	require.Error(t, err)
	assert.ErrorIs(t, err, service_errors.ErrTorrentUploadNotFound)
	assert.Zero(t, jobId)
}

// TestTorrentService_SubmitTorrentFile_WrongOwnerNotFound proves a handle
// belonging to another user cannot be submitted.
func TestTorrentService_SubmitTorrentFile_WrongOwnerNotFound(t *testing.T) {
	pending := validPendingUpload()
	pending.userId = 2
	svc := newPendingUploadTestService(pending)

	ctx := contextWithPermissions(1, uploadPermissions())

	jobId, err := svc.SubmitTorrentFile(ctx, testPendingUploadId, "", []string{testPendingUploadFilePath})
	require.Error(t, err)
	assert.ErrorIs(t, err, service_errors.ErrTorrentUploadNotFound)
	assert.Zero(t, jobId)
}

// TestTorrentService_SubmitTorrentFile_ExpiredNotFound proves a handle past
// its TTL cannot be submitted.
func TestTorrentService_SubmitTorrentFile_ExpiredNotFound(t *testing.T) {
	pending := validPendingUpload()
	pending.expiresAt = time.Now().Add(-time.Minute)
	svc := newPendingUploadTestService(pending)

	ctx := contextWithPermissions(1, uploadPermissions())

	jobId, err := svc.SubmitTorrentFile(ctx, testPendingUploadId, "", []string{testPendingUploadFilePath})
	require.Error(t, err)
	assert.ErrorIs(t, err, service_errors.ErrTorrentUploadNotFound)
	assert.Zero(t, jobId)
}

// TestTorrentService_SubmitTorrentFile_RequiresUploadPermission mirrors
// SubmitTorrent's permission check.
func TestTorrentService_SubmitTorrentFile_RequiresUploadPermission(t *testing.T) {
	svc := newPendingUploadTestService(validPendingUpload())

	ctx := contextWithPermissions(1, domain.UserPermissions{CanUpload: false})

	jobId, err := svc.SubmitTorrentFile(ctx, testPendingUploadId, "", []string{testPendingUploadFilePath})
	require.Error(t, err)
	assert.ErrorIs(t, err, user_errors.ErrPermissionDenied)
	assert.Zero(t, jobId)
}
