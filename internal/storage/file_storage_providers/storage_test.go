package file_storage_providers

import (
	"context"
	"os"
	"path"
	"sort"
	"strconv"
	"testing"

	"github.com/stretchr/testify/require"
)

// TestLocalStorageProvider_ListFiles verifies ListFiles returns files at any
// depth under the user's temp directory (flat, nested folders, folder trees
// mirroring a torrent).
func TestLocalStorageProvider_ListFiles(t *testing.T) {
	root := t.TempDir()

	const userId int64 = 42
	userTmpDir := path.Join(root, "tmp", strconv.FormatInt(userId, 10))

	files := []string{
		"flat.mp3",
		"My Album/track1.mp3",
		"My Album/Disc 1/CD1/track2.flac",
	}
	for _, rel := range files {
		full := path.Join(userTmpDir, rel)

		err := os.MkdirAll(path.Dir(full), 0755)
		require.NoError(t, err)
		err = os.WriteFile(full, []byte(rel), 0644)
		require.NoError(t, err)
	}

	provider, err := NewLocalStorageProvider(root)
	require.NoError(t, err)

	listed, err := provider.ListFiles(context.Background(), userId)
	require.NoError(t, err)

	expected := make([]string, 0, len(files))
	for _, rel := range files {
		expected = append(expected, path.Join("tmp", strconv.FormatInt(userId, 10), rel))
	}

	sort.Strings(listed)
	sort.Strings(expected)

	require.Equal(t, expected, listed)
}

// TestLocalStorageProvider_ListFiles_NoTempDir verifies the pre-existing
// os.IsNotExist behavior (no error, nil/empty result) is preserved when the
// user has no temp directory at all.
func TestLocalStorageProvider_ListFiles_NoTempDir(t *testing.T) {
	root := t.TempDir()

	provider, err := NewLocalStorageProvider(root)
	require.NoError(t, err)

	files, err := provider.ListFiles(context.Background(), 999)
	require.NoError(t, err)
	require.Empty(t, files)
}
