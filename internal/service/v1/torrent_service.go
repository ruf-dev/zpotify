package v1

import (
	"bytes"
	"context"
	"os"
	"path"
	"path/filepath"

	"github.com/anacrolix/torrent"
	"github.com/anacrolix/torrent/metainfo"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/log"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/user_errors"
	"go.zpotify.ru/zpotify/internal/utils"
)

// TorrentServiceConfig is the runtime configuration TorrentService needs.
type TorrentServiceConfig struct {
	// DownloadDir must match the torrent client's DataDir - it is where
	// completed payloads are read from during import.
	DownloadDir string
	// MaxConcurrentDownloads caps how many torrents one user may have in an
	// active (queued/downloading/importing) state at once.
	MaxConcurrentDownloads int
	// SeedAfterComplete keeps a torrent registered and seeding after its
	// audio files have been imported, instead of dropping it and deleting
	// its scratch directory.
	SeedAfterComplete bool
	// SeedTimeLimitMinutes is reserved for a future seed-time cap. Nothing
	// enforces it yet; it is carried so the config plumbing already exists.
	SeedTimeLimitMinutes int
}

// TorrentService drives user-submitted .torrent downloads: it registers them
// with the shared bittorrent client, restricts them to audio files, and - once
// complete - lands those files in the user's own storage through the same
// upload pipeline direct HTTP uploads use.
type TorrentService struct {
	torrentStorage storage.TorrentDownloadStorage
	fileMeta       storage.FileMetaStorage
	userStorage    storage.UserStorage

	binaryStorage storage.BinaryFileStorage
	jobs          storage.JobStorage

	torrentClient *torrent.Client

	cfg TorrentServiceConfig
}

func NewTorrentService(
	dataStorage storage.Storage,
	binaryStorage storage.BinaryFileStorage,
	torrentClient *torrent.Client,
	cfg TorrentServiceConfig,
) *TorrentService {
	return &TorrentService{
		torrentStorage: dataStorage.TorrentDownloads(),
		fileMeta:       dataStorage.FileMeta(),
		userStorage:    dataStorage.User(),
		binaryStorage:  binaryStorage,
		jobs:           dataStorage.Jobs(),
		torrentClient:  torrentClient,
		cfg:            cfg,
	}
}

// SubmitTorrent registers a .torrent file for download on the caller's behalf
// and returns the id of the tracking row. Only the torrent's audio files are
// downloaded; everything else is skipped.
func (s *TorrentService) SubmitTorrent(ctx context.Context, torrentFileBytes []byte, folderName string) (int64, error) {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return 0, rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	if !uCtx.Permissions.CanUpload {
		return 0, rerrors.Wrap(user_errors.ErrPermissionDenied, "not allowed to upload file")
	}

	if s.torrentClient == nil {
		return 0, rerrors.Wrap(service_errors.ErrTorrentClientUnavailable)
	}

	folderRelDir := ""
	if folderName != "" {
		sanitizedFolderName, sanitizeErr := utils.SanitizeFolderName(folderName)
		if sanitizeErr != nil {
			return 0, rerrors.Wrap(sanitizeErr, "error sanitizing folder name")
		}
		folderRelDir = sanitizedFolderName
	}

	metaInfo, err := metainfo.Load(bytes.NewReader(torrentFileBytes))
	if err != nil {
		return 0, rerrors.Wrap(service_errors.ErrInvalidTorrentFile, err.Error())
	}

	// A magnet-style metainfo carries no info dict, so there is no file list
	// to filter and no way to know what would be downloaded. Only complete
	// .torrent files are accepted.
	info, err := metaInfo.UnmarshalInfo()
	if err != nil {
		return 0, rerrors.Wrap(service_errors.ErrInvalidTorrentFile, "torrent has no usable info dict")
	}
	if len(info.Files) == 0 && info.Length == 0 {
		return 0, rerrors.Wrap(service_errors.ErrInvalidTorrentFile, "torrent has no files")
	}

	err = s.checkSubmitQuota(ctx, uCtx.UserId, uCtx.Permissions.MaxPendingTracks)
	if err != nil {
		return 0, rerrors.Wrap(err)
	}

	tor, err := s.torrentClient.AddTorrent(metaInfo)
	if err != nil {
		return 0, rerrors.Wrap(err, "error registering torrent with client")
	}

	// For a .torrent upload the info dict is already known, so this returns
	// immediately; the wait only matters if the client had to fetch metadata.
	select {
	case <-tor.GotInfo():
	case <-ctx.Done():
		return 0, rerrors.Wrap(ctx.Err(), "context canceled while waiting for torrent info")
	}

	audioFiles := applyAudioOnlyPriority(tor)
	if len(audioFiles) == 0 {
		tor.Drop()
		return 0, rerrors.Wrap(service_errors.ErrTorrentHasNoAudioFiles)
	}

	var totalBytes int64
	for _, file := range audioFiles {
		if file.Length() > uCtx.Permissions.MaxSongSizeBytes {
			tor.Drop()
			return 0, rerrors.Wrap(service_errors.ErrSongSizeLimitExceeded, file.Path())
		}
		totalBytes += file.Length()
	}

	if totalBytes > uCtx.Permissions.MaxTotalUploadBytes {
		tor.Drop()
		return 0, rerrors.Wrap(service_errors.ErrTotalUploadSizeLimitExceeded)
	}

	newDownload := domain.TorrentDownload{
		UserId:      uCtx.UserId,
		FolderName:  folderRelDir,
		InfoHash:    tor.InfoHash().HexString(),
		TorrentName: tor.Name(),
	}

	row, err := s.torrentStorage.Add(ctx, newDownload)
	if err != nil {
		tor.Drop()
		return 0, rerrors.Wrap(err, "error saving torrent download")
	}

	err = s.torrentStorage.UpdateProgress(ctx, row.Id, 0, totalBytes)
	if err != nil {
		return 0, rerrors.Wrap(err, "error setting initial torrent progress")
	}

	err = s.torrentStorage.UpdateStatus(ctx, row.Id, domain.TorrentDownloadStatusDownloading)
	if err != nil {
		return 0, rerrors.Wrap(err, "error marking torrent as downloading")
	}

	tor.DownloadAll()

	return row.Id, nil
}

// checkSubmitQuota enforces the caller's pending-upload and concurrent-torrent
// allowances before a new torrent is registered.
func (s *TorrentService) checkSubmitQuota(ctx context.Context, userId int64, maxPendingTracks int64) error {
	files, err := s.binaryStorage.ListFiles(ctx, userId)
	if err != nil {
		return rerrors.Wrap(err, "error listing temp files for limit check")
	}
	if int64(len(files)) >= maxPendingTracks {
		return rerrors.Wrap(service_errors.ErrPendingTrackLimitReached)
	}

	if s.cfg.MaxConcurrentDownloads <= 0 {
		return nil
	}

	rows, err := s.torrentStorage.ListByUser(ctx, userId, "")
	if err != nil {
		return rerrors.Wrap(err, "error listing torrent downloads for limit check")
	}

	active := 0
	for _, row := range rows {
		if isActiveTorrentStatus(row.Status) {
			active++
		}
	}

	if active >= s.cfg.MaxConcurrentDownloads {
		return rerrors.Wrap(service_errors.ErrTorrentConcurrencyLimitReached)
	}

	return nil
}

// isActiveTorrentStatus reports whether a row still occupies one of the
// caller's concurrent-download slots.
func isActiveTorrentStatus(status domain.TorrentDownloadStatus) bool {
	for _, activeStatus := range domain.ActiveTorrentDownloadStatuses {
		if status == activeStatus {
			return true
		}
	}

	return false
}

// GetJob returns one of the caller's torrent jobs.
func (s *TorrentService) GetJob(ctx context.Context, jobID int64) (domain.TorrentDownload, error) {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return domain.TorrentDownload{}, rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	row, err := s.torrentStorage.Get(ctx, jobID, uCtx.UserId)
	if err != nil {
		return domain.TorrentDownload{}, rerrors.Wrap(err, "error getting torrent job")
	}

	return row, nil
}

// ListJobs returns the caller's torrent jobs, optionally narrowed to a single
// upload folder.
func (s *TorrentService) ListJobs(ctx context.Context, folderName string) ([]domain.TorrentDownload, error) {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return nil, rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	rows, err := s.torrentStorage.ListByUser(ctx, uCtx.UserId, folderName)
	if err != nil {
		return nil, rerrors.Wrap(err, "error listing torrent jobs")
	}

	return rows, nil
}

// CancelJob stops one of the caller's torrent jobs and reclaims its scratch
// space.
func (s *TorrentService) CancelJob(ctx context.Context, jobID int64) error {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	row, err := s.torrentStorage.Get(ctx, jobID, uCtx.UserId)
	if err != nil {
		return rerrors.Wrap(err, "error getting torrent job")
	}

	err = s.torrentStorage.UpdateStatus(ctx, row.Id, domain.TorrentDownloadStatusCanceled)
	if err != nil {
		return rerrors.Wrap(err, "error marking torrent job canceled")
	}

	s.releaseTorrent(ctx, row)

	return nil
}

// PauseJob suspends data download for one of the caller's torrent jobs
// without releasing its scratch space, so it can be resumed later.
func (s *TorrentService) PauseJob(ctx context.Context, jobID int64) error {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	row, err := s.torrentStorage.Get(ctx, jobID, uCtx.UserId)
	if err != nil {
		return rerrors.Wrap(err, "error getting torrent job")
	}

	tor, ok := s.lookupTorrent(row.InfoHash)
	if ok {
		tor.DisallowDataDownload()
	}

	err = s.torrentStorage.UpdateStatus(ctx, row.Id, domain.TorrentDownloadStatusPaused)
	if err != nil {
		return rerrors.Wrap(err, "error marking torrent job paused")
	}

	return nil
}

// ResumeJob re-enables data download for one of the caller's paused torrent
// jobs.
func (s *TorrentService) ResumeJob(ctx context.Context, jobID int64) error {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	row, err := s.torrentStorage.Get(ctx, jobID, uCtx.UserId)
	if err != nil {
		return rerrors.Wrap(err, "error getting torrent job")
	}

	tor, ok := s.lookupTorrent(row.InfoHash)
	if ok {
		tor.AllowDataDownload()
	}

	err = s.torrentStorage.UpdateStatus(ctx, row.Id, domain.TorrentDownloadStatusDownloading)
	if err != nil {
		return rerrors.Wrap(err, "error marking torrent job downloading")
	}

	return nil
}

// DeleteJob stops one of the caller's torrent jobs, reclaims its scratch
// space, and permanently removes its tracking row.
func (s *TorrentService) DeleteJob(ctx context.Context, jobID int64) error {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	row, err := s.torrentStorage.Get(ctx, jobID, uCtx.UserId)
	if err != nil {
		return rerrors.Wrap(err, "error getting torrent job")
	}

	s.releaseTorrent(ctx, row)

	err = s.torrentStorage.Delete(ctx, row.Id, uCtx.UserId)
	if err != nil {
		return rerrors.Wrap(err, "error deleting torrent job")
	}

	return nil
}

// ImportCompleted runs the import of a finished torrent. It exists purely so
// the torrent_sync background task - which lives in another package - can
// drive the import inline on the tick that observes completion. It is
// deliberately absent from the service.TorrentService facade interface.
func (s *TorrentService) ImportCompleted(ctx context.Context, row domain.TorrentDownload) error {
	err := s.importCompletedTorrent(ctx, row)
	if err != nil {
		return rerrors.Wrap(err)
	}

	return nil
}

// importCompletedTorrent streams every audio file of a completed torrent
// through the shared upload pipeline into the owner's tmp/{userId}/{folder}
// storage, records the per-file outcome, and then either drops the torrent or
// leaves it seeding.
func (s *TorrentService) importCompletedTorrent(ctx context.Context, row domain.TorrentDownload) error {
	if s.torrentClient == nil {
		return rerrors.Wrap(service_errors.ErrTorrentClientUnavailable)
	}

	tor, ok := s.lookupTorrent(row.InfoHash)
	if !ok {
		return rerrors.Wrap(service_errors.ErrTorrentNotRegistered, row.InfoHash)
	}

	permissions, err := s.userStorage.GetPermissions(ctx, row.UserId)
	if err != nil {
		return rerrors.Wrap(err, "error getting permissions of torrent owner")
	}

	pipeline := uploadPipeline{
		fileMeta:      s.fileMeta,
		binaryStorage: s.binaryStorage,
		jobs:          s.jobs,
	}

	audioFiles := audioFilesOf(tor)

	imported := make([]domain.TorrentImportedFile, 0, len(audioFiles))
	succeeded := 0
	for _, file := range audioFiles {
		entry := s.importOneFile(ctx, pipeline, row, permissions, file.Path())
		if entry.Status == domain.TorrentImportedFileStatusOk {
			succeeded++
		}
		imported = append(imported, entry)
	}

	encoded, err := domain.EncodeTorrentImportedFiles(imported)
	if err != nil {
		return rerrors.Wrap(err, "error encoding imported files")
	}

	err = s.torrentStorage.SetImportedFiles(ctx, row.Id, encoded)
	if err != nil {
		return rerrors.Wrap(err, "error saving imported files")
	}

	if succeeded == 0 {
		setErr := s.torrentStorage.SetError(ctx, row.Id, "no files could be imported")
		if setErr != nil {
			return rerrors.Wrap(setErr, "error saving torrent import error")
		}

		statusErr := s.torrentStorage.UpdateStatus(ctx, row.Id, domain.TorrentDownloadStatusFailed)
		if statusErr != nil {
			return rerrors.Wrap(statusErr, "error marking torrent job failed")
		}

		s.releaseTorrent(ctx, row)

		return nil
	}

	if s.cfg.SeedAfterComplete {
		// Seeding keeps the torrent registered and its scratch data on disk.
		// No seed-time or ratio cap is enforced yet.
		statusErr := s.torrentStorage.UpdateStatus(ctx, row.Id, domain.TorrentDownloadStatusSeeding)
		if statusErr != nil {
			return rerrors.Wrap(statusErr, "error marking torrent job seeding")
		}

		return nil
	}

	err = s.torrentStorage.UpdateStatus(ctx, row.Id, domain.TorrentDownloadStatusDone)
	if err != nil {
		return rerrors.Wrap(err, "error marking torrent job done")
	}

	s.releaseTorrent(ctx, row)

	return nil
}

// importOneFile lands a single torrent file in the owner's storage, returning
// the outcome to record on the job. A per-file failure is captured rather than
// aborting the whole import.
func (s *TorrentService) importOneFile(
	ctx context.Context,
	pipeline uploadPipeline,
	row domain.TorrentDownload,
	permissions domain.UserPermissions,
	torrentPath string,
) domain.TorrentImportedFile {
	entry := domain.TorrentImportedFile{
		TorrentPath: torrentPath,
		Status:      domain.TorrentImportedFileStatusFailed,
	}

	diskPath, err := s.resolveTorrentFilePath(torrentPath)
	if err != nil {
		entry.Error = err.Error()
		return entry
	}

	src, err := os.Open(diskPath)
	if err != nil {
		entry.Error = rerrors.Wrap(err, "error opening downloaded torrent file").Error()
		return entry
	}
	defer utils.CloseWithLog(src, diskPath)

	uploadReq := uploadRequest{
		UserId:              row.UserId,
		FileNameWithExt:     path.Base(torrentPath),
		FolderRelDir:        row.FolderName,
		Content:             src,
		MaxSongSizeBytes:    permissions.MaxSongSizeBytes,
		MaxTotalUploadBytes: permissions.MaxTotalUploadBytes,
	}

	fileId, err := pipeline.store(ctx, uploadReq)
	if err != nil {
		entry.Error = err.Error()
		return entry
	}

	entry.FileId = fileId
	entry.Status = domain.TorrentImportedFileStatusOk
	entry.Error = ""

	return entry
}

// resolveTorrentFilePath maps a torrent-relative file path to its location in
// the scratch download dir, rejecting anything that would escape it.
func (s *TorrentService) resolveTorrentFilePath(torrentPath string) (string, error) {
	absDownloadDir, err := filepath.Abs(s.cfg.DownloadDir)
	if err != nil {
		return "", rerrors.Wrap(err, "error resolving torrent download dir")
	}

	candidate := filepath.Join(absDownloadDir, filepath.FromSlash(torrentPath))
	if !isWithinDir(absDownloadDir, candidate) {
		return "", rerrors.New("torrent file path escapes the download dir")
	}

	return candidate, nil
}

// lookupTorrent finds a registered torrent by its hex info hash.
func (s *TorrentService) lookupTorrent(infoHash string) (*torrent.Torrent, bool) {
	var hash metainfo.Hash

	err := hash.FromHexString(infoHash)
	if err != nil {
		return nil, false
	}

	return s.torrentClient.Torrent(hash)
}

// releaseTorrent drops a torrent from the client and removes its scratch
// directory, unless another user still has an active job on the same info
// hash (the client shares one torrent per info hash). Best-effort: failures
// are logged, never surfaced, since the job's own state is already final.
func (s *TorrentService) releaseTorrent(ctx context.Context, row domain.TorrentDownload) {
	if s.torrentClient == nil {
		return
	}

	stillWanted, err := s.hasOtherActiveJobs(ctx, row)
	if err != nil {
		log.Warn(ctx).Err(err).Int64("job_id", row.Id).Msg("could not check for other active torrent jobs")
		return
	}
	if stillWanted {
		return
	}

	tor, ok := s.lookupTorrent(row.InfoHash)
	if ok {
		tor.Drop()
	}

	scratchPath, err := torrentScratchPath(s.cfg.DownloadDir, row.TorrentName)
	if err != nil {
		log.Warn(ctx).Err(err).Int64("job_id", row.Id).Msg("could not resolve torrent scratch path")
		return
	}

	err = os.RemoveAll(scratchPath)
	if err != nil {
		log.Warn(ctx).Err(err).Str("path", scratchPath).Msg("could not remove torrent scratch dir")
	}
}

// hasOtherActiveJobs reports whether some other job still needs the same
// underlying torrent.
func (s *TorrentService) hasOtherActiveJobs(ctx context.Context, row domain.TorrentDownload) (bool, error) {
	rows, err := s.torrentStorage.ListActive(ctx)
	if err != nil {
		return false, rerrors.Wrap(err, "error listing active torrent downloads")
	}

	for _, other := range rows {
		if other.Id == row.Id {
			continue
		}
		if other.InfoHash == row.InfoHash {
			return true, nil
		}
	}

	return false, nil
}

// isWithinDir reports whether candidate lives inside dir.
func isWithinDir(dir string, candidate string) bool {
	rel, err := filepath.Rel(dir, candidate)
	if err != nil {
		return false
	}

	if rel == "." || rel == ".." {
		return false
	}

	return !hasParentPrefix(rel)
}

// hasParentPrefix reports whether a relative path starts by walking upwards.
func hasParentPrefix(rel string) bool {
	prefix := ".." + string(filepath.Separator)
	return len(rel) >= len(prefix) && rel[:len(prefix)] == prefix
}
