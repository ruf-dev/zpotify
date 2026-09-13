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
	Error           string
	CreatedAt       time.Time
	UpdatedAt       time.Time
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
