package v1

import (
	"bytes"
	"context"
	"strings"
	"time"

	"github.com/anacrolix/torrent/metainfo"
	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/audio_parsers"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/user_errors"
	"go.zpotify.ru/zpotify/internal/utils"
)

// pendingTorrentUploadTTL is how long an uploaded-but-not-yet-submitted
// .torrent file stays reachable by its handle before it is treated as gone.
const pendingTorrentUploadTTL = 15 * time.Minute

// pendingTorrentUpload is a parsed .torrent file cached under an opaque
// handle between UploadTorrentFile and the caller's later GetTorrentFile /
// SubmitTorrentFile calls, before it is registered with the bittorrent client
// or turned into a torrent_downloads row.
type pendingTorrentUpload struct {
	userId      int64
	metaInfo    *metainfo.MetaInfo
	infoHash    string
	torrentName string
	files       []domain.TorrentFileEntry
	expiresAt   time.Time
}

// UploadTorrentFile parses a .torrent file and caches it under an opaque
// handle, without registering it with the bittorrent client or creating a
// torrent_downloads row.
func (s *TorrentService) UploadTorrentFile(ctx context.Context, torrentFileBytes []byte) (domain.TorrentFile, error) {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return domain.TorrentFile{}, rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	if !uCtx.Permissions.CanUpload {
		return domain.TorrentFile{}, rerrors.Wrap(user_errors.ErrPermissionDenied, "not allowed to upload file")
	}

	metaInfo, err := metainfo.Load(bytes.NewReader(torrentFileBytes))
	if err != nil {
		return domain.TorrentFile{}, rerrors.Wrap(service_errors.ErrInvalidTorrentFile, err.Error())
	}

	// A magnet-style metainfo carries no info dict, so there is no file list
	// to show. Only complete .torrent files are accepted.
	info, err := metaInfo.UnmarshalInfo()
	if err != nil {
		return domain.TorrentFile{}, rerrors.Wrap(service_errors.ErrInvalidTorrentFile, "torrent has no usable info dict")
	}
	if len(info.Files) == 0 && info.Length == 0 {
		return domain.TorrentFile{}, rerrors.Wrap(service_errors.ErrInvalidTorrentFile, "torrent has no files")
	}

	entries := torrentFileEntriesOf(&info)

	pending := pendingTorrentUpload{
		userId:      uCtx.UserId,
		metaInfo:    metaInfo,
		infoHash:    metaInfo.HashInfoBytes().HexString(),
		torrentName: info.BestName(),
		files:       entries,
		expiresAt:   time.Now().Add(pendingTorrentUploadTTL),
	}

	id := uuid.NewString()

	s.pendingUploadsMu.Lock()
	s.sweepExpiredPendingUploadsLocked()
	s.pendingUploads[id] = pending
	s.pendingUploadsMu.Unlock()

	file := domain.TorrentFile{
		Id:          id,
		TorrentName: pending.torrentName,
		Files:       entries,
	}

	return file, nil
}

// GetTorrentFile returns a previously uploaded, not-yet-submitted torrent
// file by its opaque handle.
func (s *TorrentService) GetTorrentFile(ctx context.Context, id string) (domain.TorrentFile, error) {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return domain.TorrentFile{}, rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	// Not removed - the caller may list a pending upload's files more than
	// once while deciding what to submit.
	pending, err := s.lookupPendingUpload(id, uCtx.UserId, false)
	if err != nil {
		return domain.TorrentFile{}, rerrors.Wrap(err, "error getting pending torrent upload")
	}

	file := domain.TorrentFile{
		Id:          id,
		TorrentName: pending.torrentName,
		Files:       pending.files,
	}

	return file, nil
}

// SubmitTorrentFile registers a previously uploaded torrent file for
// download, restricted to the given selected paths, and returns the id of
// the newly created tracking job.
func (s *TorrentService) SubmitTorrentFile(ctx context.Context, id string, folderName string, selectedPaths []string) (int64, error) {
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

	// Single use - once submitted (or rejected) the handle no longer refers
	// to anything reviewable.
	pending, err := s.lookupPendingUpload(id, uCtx.UserId, true)
	if err != nil {
		return 0, rerrors.Wrap(err, "error getting pending torrent upload")
	}

	folderRelDir := ""
	if folderName != "" {
		sanitizedFolderName, sanitizeErr := utils.SanitizeFolderName(folderName)
		if sanitizeErr != nil {
			return 0, rerrors.Wrap(sanitizeErr, "error sanitizing folder name")
		}
		folderRelDir = sanitizedFolderName
	}

	existing, err := s.torrentStorage.GetByUserAndInfoHash(ctx, uCtx.UserId, pending.infoHash)
	if err != nil {
		return 0, rerrors.Wrap(err, "error checking for an existing torrent download")
	}
	if existing.Valid {
		return existing.V.Id, rerrors.Wrap(service_errors.ErrTorrentAlreadyExists)
	}

	err = s.checkSubmitQuota(ctx, uCtx.UserId, uCtx.Permissions.MaxPendingTracks)
	if err != nil {
		return 0, rerrors.Wrap(err)
	}

	tor, err := s.torrentClient.AddTorrent(pending.metaInfo)
	if err != nil {
		return 0, rerrors.Wrap(err, "error registering torrent with client")
	}

	// For a previously uploaded .torrent the info dict is already known, so
	// this returns immediately.
	select {
	case <-tor.GotInfo():
	case <-ctx.Done():
		return 0, rerrors.Wrap(ctx.Err(), "context canceled while waiting for torrent info")
	}

	selectedFiles, err := applySelectedPriority(tor, selectedPaths)
	if err != nil {
		tor.Drop()
		return 0, rerrors.Wrap(err)
	}

	jobId, err := s.finalizeTorrentSubmission(ctx, uCtx, tor, folderRelDir, pending.infoHash, selectedFiles)
	if err != nil {
		return 0, rerrors.Wrap(err)
	}

	return jobId, nil
}

// lookupPendingUpload finds a cached upload by its opaque handle, treating a
// missing, expired, or not-owned-by-caller entry as not found. An expired
// entry is deleted as it's found. When remove is true the entry is also
// consumed on a successful lookup - SubmitTorrentFile is single-use, while
// GetTorrentFile leaves it in place so the caller can list it more than once.
func (s *TorrentService) lookupPendingUpload(id string, userId int64, remove bool) (pendingTorrentUpload, error) {
	s.pendingUploadsMu.Lock()
	defer s.pendingUploadsMu.Unlock()

	pending, ok := s.pendingUploads[id]
	if !ok {
		return pendingTorrentUpload{}, rerrors.Wrap(service_errors.ErrTorrentUploadNotFound)
	}

	if time.Now().After(pending.expiresAt) {
		delete(s.pendingUploads, id)
		return pendingTorrentUpload{}, rerrors.Wrap(service_errors.ErrTorrentUploadNotFound)
	}

	if pending.userId != userId {
		return pendingTorrentUpload{}, rerrors.Wrap(service_errors.ErrTorrentUploadNotFound)
	}

	if remove {
		delete(s.pendingUploads, id)
	}

	return pending, nil
}

// sweepExpiredPendingUploadsLocked removes cache entries past their TTL. It
// is called opportunistically from UploadTorrentFile instead of running a
// background sweep goroutine; the caller must already hold pendingUploadsMu.
func (s *TorrentService) sweepExpiredPendingUploadsLocked() {
	now := time.Now()

	for id, pending := range s.pendingUploads {
		if now.After(pending.expiresAt) {
			delete(s.pendingUploads, id)
		}
	}
}

// torrentFileEntriesOf lists every file described by a torrent's info dict,
// without registering it with the bittorrent client. UpvertedFiles normalizes
// the single-file-torrent case.
//
// The path is built the same way *torrent.Torrent does internally
// (t.initFiles, unexported) - info.BestName() joined with the file's own
// path components - rather than through FileInfo.DisplayPath: DisplayPath
// omits the torrent's top-level name for a multi-file torrent, while
// torrent.File.Path() (what SubmitTorrentFile's selectedPaths is compared
// against post-AddTorrent) always includes it. Replicating the join here
// keeps the two in sync for both single- and multi-file torrents.
func torrentFileEntriesOf(info *metainfo.Info) []domain.TorrentFileEntry {
	upvertedFiles := info.UpvertedFiles()

	entries := make([]domain.TorrentFileEntry, 0, len(upvertedFiles))
	for _, fileInfo := range upvertedFiles {
		pathParts := append([]string{info.BestName()}, fileInfo.BestPath()...)
		filePath := strings.Join(pathParts, "/")

		entry := domain.TorrentFileEntry{
			Path:      filePath,
			SizeBytes: fileInfo.Length,
			Supported: audio_parsers.IsSupported(filePath),
		}
		entries = append(entries, entry)
	}

	return entries
}
