package v1

import (
	"bytes"
	"context"
	"database/sql"
	"image"
	"image/jpeg"
	"os"
	"path"
	"sort"
	"strconv"
	"testing"

	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage/file_storage_providers"
	"go.zpotify.ru/zpotify/internal/storage/pg"
	"go.zpotify.ru/zpotify/internal/utils"
)

// torrentImportTestDSN mirrors the dev Postgres connection settings in config/dev.yaml.
const torrentImportTestDSN = "host=localhost port=15432 user=zpotify dbname=zpotify_db sslmode=disable"

const (
	testJobFolder   = "The Wall"
	testCd1Track    = "Root/CD1/a.flac"
	testSingleTrack = "song.flac"
)

func Test_TorrentImportFolder_Cases(t *testing.T) {
	cases := []struct {
		name        string
		rootFolder  string
		torrentPath string
		want        string
	}{
		{"single file lands in job folder", testJobFolder, testSingleTrack, testJobFolder},
		{"multi file keeps torrent root", testJobFolder, testCd1Track, "The Wall/Root/CD1"},
		{"no job folder keeps torrent dirs", "", testCd1Track, "Root/CD1"},
		{"single file without job folder", "", testSingleTrack, ""},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := torrentImportFolder(tc.rootFolder, tc.torrentPath)
			require.NoError(t, err)
			require.Equal(t, tc.want, got)
		})
	}
}

func Test_TorrentImportFolder_RejectsUnsafeSegments(t *testing.T) {
	cases := []struct {
		name        string
		torrentPath string
	}{
		{"control char", "Root\x01/a.flac"},
		{"parent traversal", "../Root/a.flac"},
		{"backslash", "Root\\CD1/a.flac"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			_, err := torrentImportFolder(testJobFolder, tc.torrentPath)
			require.ErrorIs(t, err, utils.ErrInvalidFolderName)
		})
	}
}

func openTorrentImportTestTx(t *testing.T) (*sql.Tx, *sql.DB) {
	t.Helper()

	db, err := sql.Open("postgres", torrentImportTestDSN)
	if err != nil {
		t.Skipf("skipping: cannot open connection to test postgres: %v", err)
	}

	err = db.PingContext(context.Background())
	if err != nil {
		_ = db.Close()
		t.Skipf("skipping: dev postgres at %q is not reachable: %v", torrentImportTestDSN, err)
	}

	tx, err := db.Begin()
	require.NoError(t, err)

	t.Cleanup(func() {
		_ = tx.Rollback()
		_ = db.Close()
	})

	return tx, db
}

func writeTorrentFixture(t *testing.T, downloadDir string, torrentPath string, content []byte) {
	t.Helper()

	full := path.Join(downloadDir, torrentPath)

	err := os.MkdirAll(path.Dir(full), 0755)
	require.NoError(t, err)

	err = os.WriteFile(full, content, 0644)
	require.NoError(t, err)
}

func newTestJpeg(t *testing.T) []byte {
	t.Helper()

	var buf bytes.Buffer
	img := image.NewRGBA(image.Rect(0, 0, 2, 2))

	err := jpeg.Encode(&buf, img, nil)
	require.NoError(t, err)

	return buf.Bytes()
}

func Test_TorrentService_importOneFile_KeepsTorrentFolderStructure(t *testing.T) {
	ctx := context.Background()
	tx, db := openTorrentImportTestTx(t)

	var userId int64
	err := tx.QueryRowContext(ctx, "INSERT INTO users (username) VALUES ($1) RETURNING id", "torrent-import-test").
		Scan(&userId)
	require.NoError(t, err)

	storageRoot := t.TempDir()
	binaryStorage, err := file_storage_providers.NewLocalStorageProvider(storageRoot)
	require.NoError(t, err)

	pipeline := uploadPipeline{
		fileMeta:      pg.NewFileMetaStorage(db).WithTx(tx),
		binaryStorage: binaryStorage,
		jobs:          newFakeJobStorage(),
	}

	downloadDir := t.TempDir()
	writeTorrentFixture(t, downloadDir, testCd1Track, []byte("cd1-track"))
	writeTorrentFixture(t, downloadDir, "Root/CD2/a.flac", []byte("cd2-track-different"))
	writeTorrentFixture(t, downloadDir, "Root/cover.jpg", newTestJpeg(t))

	cfg := TorrentServiceConfig{DownloadDir: downloadDir}
	svc := &TorrentService{cfg: cfg}

	row := domain.TorrentDownload{UserId: userId, FolderName: testJobFolder}
	permissions := domain.UserPermissions{
		MaxSongSizeBytes:    10 << 20,
		MaxTotalUploadBytes: 100 << 20,
	}

	userDir := path.Join("tmp", strconv.FormatInt(userId, 10), testJobFolder, "Root")
	wantPaths := map[string]string{
		testCd1Track:      path.Join(userDir, "CD1", "a.flac"),
		"Root/CD2/a.flac": path.Join(userDir, "CD2", "a.flac"),
		"Root/cover.jpg":  path.Join(userDir, "cover.jpg"),
	}

	for torrentPath, wantPath := range wantPaths {
		entry := svc.importOneFile(ctx, pipeline, row, permissions, torrentPath)

		require.Empty(t, entry.Error)
		require.Equal(t, domain.TorrentImportedFileStatusOk, entry.Status)
		require.Equal(t, wantPath, entry.FilePath)
	}

	listed, err := binaryStorage.ListFiles(ctx, userId)
	require.NoError(t, err)

	want := make([]string, 0, len(wantPaths))
	for _, wantPath := range wantPaths {
		want = append(want, wantPath)
	}
	sort.Strings(want)
	sort.Strings(listed)

	require.Equal(t, want, listed)
}
