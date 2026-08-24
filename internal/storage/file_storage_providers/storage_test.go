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

// TestLocalStorageProvider_ListFiles verifies ListFiles returns both flat
// files directly under the user's temp directory and files one level deep
// inside a subdirectory (mirroring a dropped folder), while not walking into
// a second level of nesting (folder-in-folder).
func TestLocalStorageProvider_ListFiles(t *testing.T) {
	root := t.TempDir()

	const userId int64 = 42
	userTmpDir := path.Join(root, "tmp", strconv.FormatInt(userId, 10))

	err := os.MkdirAll(userTmpDir, 0755)
	require.NoError(t, err)

	// Flat file directly under the user's temp directory.
	err = os.WriteFile(path.Join(userTmpDir, "flat.mp3"), []byte("flat"), 0644)
	require.NoError(t, err)

	// File inside one subdirectory (mirrors a dropped folder).
	folderDir := path.Join(userTmpDir, "My Album")
	err = os.MkdirAll(folderDir, 0755)
	require.NoError(t, err)
	err = os.WriteFile(path.Join(folderDir, "track1.mp3"), []byte("track1"), 0644)
	require.NoError(t, err)

	// A second level of nesting under the subdirectory must be ignored, not
	// walked into or errored on.
	nestedDir := path.Join(folderDir, "nested")
	err = os.MkdirAll(nestedDir, 0755)
	require.NoError(t, err)
	err = os.WriteFile(path.Join(nestedDir, "should-not-appear.mp3"), []byte("nested"), 0644)
	require.NoError(t, err)

	provider, err := NewLocalStorageProvider(root)
	require.NoError(t, err)

	files, err := provider.ListFiles(context.Background(), userId)
	require.NoError(t, err)

	sort.Strings(files)

	expected := []string{
		path.Join("tmp", strconv.FormatInt(userId, 10), "My Album", "track1.mp3"),
		path.Join("tmp", strconv.FormatInt(userId, 10), "flat.mp3"),
	}
	sort.Strings(expected)

	require.Equal(t, expected, files)
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
