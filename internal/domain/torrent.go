package domain

import (
	"encoding/json"
	"time"

	"go.redsock.ru/rerrors"
)

// TorrentDownloadStatus mirrors the torrent_download_status Postgres enum.
type TorrentDownloadStatus string

const (
	TorrentDownloadStatusQueued      TorrentDownloadStatus = "queued"
	TorrentDownloadStatusDownloading TorrentDownloadStatus = "downloading"
	TorrentDownloadStatusImporting   TorrentDownloadStatus = "importing"
	TorrentDownloadStatusSeeding     TorrentDownloadStatus = "seeding"
	TorrentDownloadStatusDone        TorrentDownloadStatus = "done"
	TorrentDownloadStatusFailed      TorrentDownloadStatus = "failed"
	TorrentDownloadStatusCanceled    TorrentDownloadStatus = "canceled"
	TorrentDownloadStatusPaused      TorrentDownloadStatus = "paused"
)

// ActiveTorrentDownloadStatuses are the statuses considered "in progress" by
// the background sync task's polling loop.
var ActiveTorrentDownloadStatuses = []TorrentDownloadStatus{
	TorrentDownloadStatusQueued,
	TorrentDownloadStatusDownloading,
	TorrentDownloadStatusImporting,
	TorrentDownloadStatusPaused,
}

// TorrentDownload tracks the state of a single user-initiated torrent download.
type TorrentDownload struct {
	Id              int64
	UserId          int64
	FolderName      string
	InfoHash        string
	TorrentName     string
	Status          TorrentDownloadStatus
	TotalBytes      int64
	DownloadedBytes int64
	ImportedFiles   []string
	Files           []TorrentFileProgress
	Error           string
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

// TorrentFileProgress is one file's live download progress within a torrent
// job - the per-file breakdown behind TorrentDownload's aggregate
// DownloadedBytes/TotalBytes.
type TorrentFileProgress struct {
	Path            string `json:"path"`
	DownloadedBytes int64  `json:"downloaded_bytes"`
	TotalBytes      int64  `json:"total_bytes"`
}

// Per-file outcomes recorded on a completed torrent import.
const (
	TorrentImportedFileStatusOk     = "ok"
	TorrentImportedFileStatusFailed = "failed"
)

// TorrentImportedFile is one file lifted out of a completed torrent and run
// through the shared upload pipeline. A failed entry keeps its Error so the
// user can see which tracks did not make it.
type TorrentImportedFile struct {
	TorrentPath string `json:"torrent_path"`
	FileId      int64  `json:"file_id,omitempty"`
	Status      string `json:"status"`
	Error       string `json:"error,omitempty"`
	// FilePath is the file's actual location in the user's storage (as
	// stored on files_meta), not the torrent-internal path above - it is
	// what the frontend must join with the webserver base to fetch the
	// file, e.g. to preview an imported cover image.
	FilePath string `json:"file_path,omitempty"`
	// FileDeleted is computed at read time, not written by the import
	// pipeline - it reflects whether FileId's files_meta row still exists,
	// so a file removed independently of the torrent job (e.g. deleted
	// straight from the library) shows that on read instead of silently
	// pretending it's still there.
	FileDeleted bool `json:"file_deleted,omitempty"`
}

// EncodeTorrentImportedFiles renders each entry as a compact JSON object
// string. TorrentDownload.ImportedFiles is a []string (the imported_files
// jsonb column is an array of strings), so per-file detail beyond the path is
// carried inside each element rather than requiring a schema change.
func EncodeTorrentImportedFiles(files []TorrentImportedFile) ([]string, error) {
	encoded := make([]string, 0, len(files))
	for _, file := range files {
		raw, err := json.Marshal(file)
		if err != nil {
			return nil, rerrors.Wrap(err, "error marshalling imported torrent file")
		}

		encoded = append(encoded, string(raw))
	}

	return encoded, nil
}

// TorrentFile is an uploaded-but-not-yet-submitted .torrent file, identified
// by an opaque handle returned from the upload call. It is not backed by a
// torrent_downloads row - that row is only created once the file is
// submitted for download.
type TorrentFile struct {
	Id          string
	TorrentName string
	Files       []TorrentFileEntry
}

// TorrentFileEntry is one file listed inside an uploaded .torrent's info
// dict, before any of it has been downloaded.
type TorrentFileEntry struct {
	Path      string
	SizeBytes int64
	Supported bool
}

// DecodeTorrentImportedFiles parses entries written by
// EncodeTorrentImportedFiles. An element that is not a JSON object is treated
// as a bare torrent-relative path, so rows written by any other producer still
// render sensibly.
func DecodeTorrentImportedFiles(raw []string) []TorrentImportedFile {
	files := make([]TorrentImportedFile, 0, len(raw))
	for _, entry := range raw {
		var file TorrentImportedFile

		err := json.Unmarshal([]byte(entry), &file)
		if err != nil || file.TorrentPath == "" {
			fallback := TorrentImportedFile{
				TorrentPath: entry,
				Status:      TorrentImportedFileStatusOk,
			}
			files = append(files, fallback)
			continue
		}

		files = append(files, file)
	}

	return files
}
