package v1

import (
	"testing"
	"time"

	"github.com/anacrolix/torrent"
	"github.com/anacrolix/torrent/bencode"
	"github.com/anacrolix/torrent/metainfo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
)

const (
	testTrackFileName       = "01.mp3"
	testCoverFileName       = "cover.jpg"
	testUnsupportedFileName = "readme.txt"
)

// newTestTorrent registers a torrent built from the given files with a client
// that has every network path disabled, so the test never touches the
// network - it exists purely to get real *torrent.File values to prioritize.
func newTestTorrent(t *testing.T, files []metainfo.FileInfo) *torrent.Torrent {
	t.Helper()

	const pieceLength = int64(16384)

	var totalLength int64
	for _, file := range files {
		totalLength += file.Length
	}

	numPieces := (totalLength + pieceLength - 1) / pieceLength
	if numPieces == 0 {
		numPieces = 1
	}

	info := metainfo.Info{
		PieceLength: pieceLength,
		Name:        "TestTorrent",
		Files:       files,
		Pieces:      make([]byte, 20*numPieces),
	}

	infoBytes, err := bencode.Marshal(info)
	require.NoError(t, err)

	mi := &metainfo.MetaInfo{InfoBytes: infoBytes}

	cfg := torrent.NewDefaultClientConfig()
	cfg.DataDir = t.TempDir()
	cfg.DisableTCP = true
	cfg.DisableUTP = true
	cfg.NoDHT = true
	cfg.DisableWebtorrent = true
	cfg.DisableWebseeds = true
	cfg.NoUpload = true
	cfg.Seed = false
	cfg.ListenPort = 0

	client, err := torrent.NewClient(cfg)
	require.NoError(t, err)
	t.Cleanup(func() { client.Close() })

	tor, err := client.AddTorrent(mi)
	require.NoError(t, err)

	select {
	case <-tor.GotInfo():
	case <-time.After(5 * time.Second):
		t.Fatal("timed out waiting for torrent info")
	}

	return tor
}

// TestApplySelectedPriority_SelectsValidSubset proves only the caller's
// chosen, supported files are prioritized for download and returned, and an
// unselected file is left at zero priority even though it is itself a
// supported format.
func TestApplySelectedPriority_SelectsValidSubset(t *testing.T) {
	files := []metainfo.FileInfo{
		{Path: []string{testTrackFileName}, Length: 100},
		{Path: []string{testCoverFileName}, Length: 50},
	}
	tor := newTestTorrent(t, files)

	selectedTrackPath := "TestTorrent/" + testTrackFileName
	skippedCoverPath := "TestTorrent/" + testCoverFileName

	selected, err := applySelectedPriority(tor, []string{selectedTrackPath})
	require.NoError(t, err)
	require.Len(t, selected, 1)
	assert.Equal(t, selectedTrackPath, selected[0].Path())
	assert.Equal(t, torrent.PiecePriorityNormal, selected[0].Priority())

	for _, file := range tor.Files() {
		if file.Path() == skippedCoverPath {
			assert.Equal(t, torrent.PiecePriorityNone, file.Priority())
		}
	}
}

// TestApplySelectedPriority_SelectsCoverImage proves a cover image can be
// selected alongside an audio file - not just audio formats - so it can be
// downloaded now and used as album art later.
func TestApplySelectedPriority_SelectsCoverImage(t *testing.T) {
	files := []metainfo.FileInfo{
		{Path: []string{testTrackFileName}, Length: 100},
		{Path: []string{testCoverFileName}, Length: 50},
	}
	tor := newTestTorrent(t, files)

	trackPath := "TestTorrent/" + testTrackFileName
	coverPath := "TestTorrent/" + testCoverFileName

	selected, err := applySelectedPriority(tor, []string{trackPath, coverPath})
	require.NoError(t, err)
	require.Len(t, selected, 2)

	for _, file := range selected {
		assert.Equal(t, torrent.PiecePriorityNormal, file.Priority())
	}
}

// TestApplySelectedPriority_RejectsPathNotInTorrent proves a selected path
// that does not match any file in the torrent is rejected outright, rather
// than silently ignored.
func TestApplySelectedPriority_RejectsPathNotInTorrent(t *testing.T) {
	files := []metainfo.FileInfo{
		{Path: []string{testTrackFileName}, Length: 100},
	}
	tor := newTestTorrent(t, files)

	selected, err := applySelectedPriority(tor, []string{"TestTorrent/does-not-exist.mp3"})
	require.Error(t, err)
	assert.Nil(t, selected)
}

// TestApplySelectedPriority_RejectsUnsupportedPath proves a selected path
// that matches a real file, but one neither the audio parsers nor the cover
// image allowlist support, is rejected.
func TestApplySelectedPriority_RejectsUnsupportedPath(t *testing.T) {
	files := []metainfo.FileInfo{
		{Path: []string{testTrackFileName}, Length: 100},
		{Path: []string{testUnsupportedFileName}, Length: 50},
	}
	tor := newTestTorrent(t, files)

	selected, err := applySelectedPriority(tor, []string{"TestTorrent/" + testUnsupportedFileName})
	require.Error(t, err)
	assert.Nil(t, selected)
}

// TestApplySelectedPriority_RejectsEmptySelection proves an empty selection
// is rejected instead of silently downloading nothing.
func TestApplySelectedPriority_RejectsEmptySelection(t *testing.T) {
	files := []metainfo.FileInfo{
		{Path: []string{testTrackFileName}, Length: 100},
	}
	tor := newTestTorrent(t, files)

	selected, err := applySelectedPriority(tor, nil)
	require.Error(t, err)
	assert.Nil(t, selected)
}

// TestTorrentFileEntriesOf_MultiFileTorrent proves the listed paths match
// what torrent.File.Path() returns post-AddTorrent (the torrent's top-level
// name joined with each file's own path), not FileInfo.DisplayPath (which
// omits that name for a multi-file torrent), and that a cover image is
// listed as supported alongside audio.
func TestTorrentFileEntriesOf_MultiFileTorrent(t *testing.T) {
	info := &metainfo.Info{
		Name: "Album",
		Files: []metainfo.FileInfo{
			{Path: []string{"Track One.mp3"}, Length: 100},
			{Path: []string{"Artwork.jpg"}, Length: 50},
			{Path: []string{"liner notes.txt"}, Length: 10},
		},
	}

	entries := torrentFileEntriesOf(info)

	want := []domain.TorrentFileEntry{
		{Path: "Album/Track One.mp3", SizeBytes: 100, Supported: true},
		{Path: "Album/Artwork.jpg", SizeBytes: 50, Supported: true},
		{Path: "Album/liner notes.txt", SizeBytes: 10, Supported: false},
	}
	assert.Equal(t, want, entries)
}

// TestTorrentFileEntriesOf_SingleFileTorrent covers the info dict shape
// UpvertedFiles synthesizes when there is no Files list.
func TestTorrentFileEntriesOf_SingleFileTorrent(t *testing.T) {
	info := &metainfo.Info{
		Name:   "song.flac",
		Length: 12345,
	}

	entries := torrentFileEntriesOf(info)

	want := []domain.TorrentFileEntry{
		{Path: "song.flac", SizeBytes: 12345, Supported: true},
	}
	assert.Equal(t, want, entries)
}
