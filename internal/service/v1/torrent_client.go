package v1

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/anacrolix/torrent"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/audio_parsers"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
)

// TorrentClientConfig is the subset of runtime config the bittorrent client
// needs. It mirrors the torrent_* environment entries.
type TorrentClientConfig struct {
	// DownloadDir is the scratch root anacrolix writes torrent payloads to.
	// It is deliberately separate from the user-facing file storage: files
	// only reach a user's own tmp/{userId}/{folder} once imported.
	DownloadDir string
	ListenPort  int
	// Seed keeps completed torrents uploading after import.
	Seed bool
}

// NewTorrentClient builds the process-wide bittorrent client. It is
// constructed once during app wiring and shared by TorrentService and the
// torrent_sync background task.
func NewTorrentClient(cfg TorrentClientConfig) (*torrent.Client, error) {
	downloadDir := cfg.DownloadDir
	if downloadDir == "" {
		return nil, rerrors.New("torrent download dir is not configured")
	}

	err := os.MkdirAll(downloadDir, 0o755)
	if err != nil {
		return nil, rerrors.Wrap(err, "error creating torrent download dir")
	}

	clientCfg := torrent.NewDefaultClientConfig()
	clientCfg.DataDir = downloadDir
	clientCfg.Seed = cfg.Seed
	clientCfg.NoUpload = !cfg.Seed
	if cfg.ListenPort != 0 {
		clientCfg.ListenPort = cfg.ListenPort
	}

	client, err := torrent.NewClient(clientCfg)
	if err != nil {
		return nil, rerrors.Wrap(err, "error creating torrent client")
	}

	return client, nil
}

// selectAudioFileNames partitions torrent-relative file paths into the ones
// worth downloading (a format the audio parsers understand) and the rest.
//
// It works on plain names rather than *torrent.File so the decision is
// unit-testable without any bittorrent I/O.
func selectAudioFileNames(names []string) (selected []string, skipped []string) {
	selected = make([]string, 0, len(names))
	skipped = make([]string, 0, len(names))

	for _, name := range names {
		if audio_parsers.IsSupported(name) {
			selected = append(selected, name)
			continue
		}
		skipped = append(skipped, name)
	}

	return selected, skipped
}

// audioFilesOf returns the files of tor that are in a format the audio parsers
// understand. It is the single definition of "what a torrent job downloads",
// shared by submission, progress accounting and import.
func audioFilesOf(tor *torrent.Torrent) []*torrent.File {
	files := tor.Files()

	audioFiles := make([]*torrent.File, 0, len(files))
	for _, file := range files {
		if audio_parsers.IsSupported(file.Path()) {
			audioFiles = append(audioFiles, file)
		}
	}

	return audioFiles
}

// applyAudioOnlyPriority marks every audio file in tor for download at normal
// priority and every other file as skipped, and returns the audio files.
//
// The caller must have waited on tor.GotInfo() first - a torrent with no info
// dict has no file list to prioritize yet.
func applyAudioOnlyPriority(tor *torrent.Torrent) []*torrent.File {
	for _, file := range tor.Files() {
		if !audio_parsers.IsSupported(file.Path()) {
			file.SetPriority(torrent.PiecePriorityNone)
			continue
		}

		file.SetPriority(torrent.PiecePriorityNormal)
	}

	return audioFilesOf(tor)
}

// applySelectedPriority marks exactly the caller's chosen, supported files in
// tor for download at normal priority and everything else as skipped, and
// returns the selected files. "Supported" here is isSupportedUpload's - a
// parsable audio format or a cover image - since a selection may pair an
// audio file with e.g. a cover.jpg to keep for later use as its album art.
//
// Unlike applyAudioOnlyPriority, selectedPaths is caller-controlled input:
// every entry must match a real, supported file in tor, and the resulting
// selection must be non-empty - a bogus path is rejected rather than
// silently dropped.
//
// The caller must have waited on tor.GotInfo() first - a torrent with no info
// dict has no file list to prioritize yet.
func applySelectedPriority(tor *torrent.Torrent, selectedPaths []string) ([]*torrent.File, error) {
	wanted := make(map[string]bool, len(selectedPaths))
	for _, selectedPath := range selectedPaths {
		wanted[selectedPath] = true
	}

	matched := make(map[string]bool, len(selectedPaths))
	selected := make([]*torrent.File, 0, len(selectedPaths))

	for _, file := range tor.Files() {
		filePath := file.Path()

		if wanted[filePath] && isSupportedUpload(filePath) {
			file.SetPriority(torrent.PiecePriorityNormal)
			selected = append(selected, file)
			matched[filePath] = true
			continue
		}

		file.SetPriority(torrent.PiecePriorityNone)
	}

	for _, selectedPath := range selectedPaths {
		if !matched[selectedPath] {
			return nil, rerrors.Wrap(service_errors.ErrTorrentInvalidSelection, selectedPath)
		}
	}

	if len(selected) == 0 {
		return nil, rerrors.Wrap(service_errors.ErrTorrentInvalidSelection, "no files selected")
	}

	return selected, nil
}

// selectedFilesOf returns the files of tor that were actually marked for
// download (a non-zero piece priority), regardless of what criterion put
// them there - applyAudioOnlyPriority's audio-only rule or
// applySelectedPriority's caller-chosen subset. This is the single
// definition of "what a torrent job downloads" used once selection has
// already happened, by progress accounting and import; unlike audioFilesOf it
// does not re-derive the selection from file extensions, so it stays correct
// for a job that also selected a cover image.
func selectedFilesOf(tor *torrent.Torrent) []*torrent.File {
	files := tor.Files()

	selected := make([]*torrent.File, 0, len(files))
	for _, file := range files {
		if file.Priority() != torrent.PiecePriorityNone {
			selected = append(selected, file)
		}
	}

	return selected
}

// torrentScratchPath resolves where anacrolix stores a torrent named
// torrentName under downloadDir, refusing any name that would escape the
// download dir (a torrent's info name is attacker-controlled).
func torrentScratchPath(downloadDir string, torrentName string) (string, error) {
	if torrentName == "" {
		return "", rerrors.New("torrent has no name")
	}

	absDownloadDir, err := filepath.Abs(downloadDir)
	if err != nil {
		return "", rerrors.Wrap(err, "error resolving torrent download dir")
	}

	candidate := filepath.Join(absDownloadDir, torrentName)

	absCandidate, err := filepath.Abs(candidate)
	if err != nil {
		return "", rerrors.Wrap(err, "error resolving torrent scratch path")
	}

	if absCandidate != absDownloadDir && !strings.HasPrefix(absCandidate, absDownloadDir+string(filepath.Separator)) {
		return "", rerrors.New("torrent name escapes the download dir")
	}

	if absCandidate == absDownloadDir {
		return "", rerrors.New("torrent name resolves to the download dir itself")
	}

	return absCandidate, nil
}
