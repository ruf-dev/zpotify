package v1

import (
	"bytes"
	"context"
	"strings"
	"time"

	"github.com/anacrolix/torrent"
	"github.com/anacrolix/torrent/metainfo"
	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/log"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/user_errors"
	"go.zpotify.ru/zpotify/internal/utils"
)

// pendingTorrentUploadTTL is how long an uploaded-but-not-yet-submitted
// .torrent file stays reachable by its handle before it is treated as gone.
const pendingTorrentUploadTTL = 15 * time.Minute

// pendingTorrentUpload is a parsed .torrent file or a magnet link cached under
// an opaque handle between UploadTorrentFile / AddTorrentMagnet and the
// caller's later GetTorrentFile / SubmitTorrentFile calls, before it is turned
// into a torrent_downloads row.
//
// A magnet entry (tor != nil) is already registered with the bittorrent
// client, which fetches only its info dict from peers. files stays nil until
// that arrives. Every removal of a magnet entry from the cache goes through
// deletePendingLocked, which closes done exactly once and stops the expiry
// timer; the caller then releases the client torrent via dropUnusedTorrent.
type pendingTorrentUpload struct {
	userId      int64
	metaInfo    *metainfo.MetaInfo
	infoHash    string
	torrentName string
	files       []domain.TorrentFileEntry
	expiresAt   time.Time

	tor         *torrent.Torrent
	done        chan struct{}
	expiryTimer *time.Timer
	timedOut    bool
}

// pendingLookupMode says what a lookup does with the entry it finds.
type pendingLookupMode int

const (
	// lookupPeek leaves the entry in place.
	lookupPeek pendingLookupMode = iota
	// lookupSubmit consumes the entry, but refuses a magnet whose info dict
	// has not arrived yet, leaving it in place.
	lookupSubmit
	// lookupDiscard consumes the entry whatever state it is in.
	lookupDiscard
)

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
	expired := s.sweepExpiredPendingUploadsLocked()
	s.pendingUploads[id] = pending
	s.pendingUploadsMu.Unlock()

	s.dropPendingTorrents(ctx, expired)

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
	pending, err := s.lookupPendingUpload(ctx, id, uCtx.UserId, lookupPeek)
	if err != nil {
		return domain.TorrentFile{}, rerrors.Wrap(err, "error getting pending torrent upload")
	}

	file := domain.TorrentFile{
		Id:          id,
		TorrentName: pending.torrentName,
		Files:       pending.files,
		IsResolving: pending.tor != nil && pending.files == nil,
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
	// to anything reviewable. A magnet still fetching its metadata is the
	// exception: it is refused without being consumed.
	pending, err := s.lookupPendingUpload(ctx, id, uCtx.UserId, lookupSubmit)
	if err != nil {
		return 0, rerrors.Wrap(err, "error getting pending torrent upload")
	}

	folderRelDir := ""
	if folderName != "" {
		sanitizedFolderName, sanitizeErr := utils.SanitizeFolderName(folderName)
		if sanitizeErr != nil {
			s.dropPendingTorrent(ctx, pending)
			return 0, rerrors.Wrap(sanitizeErr, "error sanitizing folder name")
		}
		folderRelDir = sanitizedFolderName
	}

	existing, err := s.torrentStorage.GetByUserAndInfoHash(ctx, uCtx.UserId, pending.infoHash)
	if err != nil {
		s.dropPendingTorrent(ctx, pending)
		return 0, rerrors.Wrap(err, "error checking for an existing torrent download")
	}
	if existing.Valid {
		s.dropPendingTorrent(ctx, pending)
		return existing.V.Id, rerrors.Wrap(service_errors.ErrTorrentAlreadyExists)
	}

	err = s.checkSubmitQuota(ctx, uCtx.UserId, uCtx.Permissions.MaxPendingTracks)
	if err != nil {
		s.dropPendingTorrent(ctx, pending)
		return 0, rerrors.Wrap(err)
	}

	tor := pending.tor
	if tor == nil {
		tor, err = s.torrentClient.AddTorrent(pending.metaInfo)
		if err != nil {
			return 0, rerrors.Wrap(err, "error registering torrent with client")
		}
	}

	// For a .torrent upload, or a magnet whose metadata already arrived, the
	// info dict is known, so this returns immediately.
	select {
	case <-tor.GotInfo():
	case <-ctx.Done():
		s.dropPendingTorrent(ctx, pending)
		return 0, rerrors.Wrap(ctx.Err(), "context canceled while waiting for torrent info")
	}

	selectedFiles, err := applySelectedPriority(tor, selectedPaths)
	if err != nil {
		s.dropUnusedTorrent(ctx, pending.infoHash)
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
// entry is deleted as it's found, and a magnet's client torrent released.
// What happens to a found entry depends on mode: GetTorrentFile peeks so the
// caller can list it more than once, SubmitTorrentFile consumes it, and
// DiscardTorrentFile consumes it whatever its state. A magnet whose metadata
// fetch timed out is reported once as ErrTorrentMetadataTimeout and then
// forgotten, except for a discard, which just removes it.
func (s *TorrentService) lookupPendingUpload(
	ctx context.Context,
	id string,
	userId int64,
	mode pendingLookupMode,
) (pendingTorrentUpload, error) {
	s.pendingUploadsMu.Lock()

	pending, ok := s.pendingUploads[id]
	if !ok {
		s.pendingUploadsMu.Unlock()
		return pendingTorrentUpload{}, rerrors.Wrap(service_errors.ErrTorrentUploadNotFound)
	}

	if time.Now().After(pending.expiresAt) {
		s.deletePendingLocked(id)
		s.pendingUploadsMu.Unlock()

		s.dropPendingTorrent(ctx, pending)
		return pendingTorrentUpload{}, rerrors.Wrap(service_errors.ErrTorrentUploadNotFound)
	}

	if pending.userId != userId {
		s.pendingUploadsMu.Unlock()
		return pendingTorrentUpload{}, rerrors.Wrap(service_errors.ErrTorrentUploadNotFound)
	}

	defer s.pendingUploadsMu.Unlock()

	if pending.timedOut {
		s.deletePendingLocked(id)
		if mode == lookupDiscard {
			return pending, nil
		}
		return pendingTorrentUpload{}, rerrors.Wrap(service_errors.ErrTorrentMetadataTimeout)
	}

	if mode == lookupSubmit && pending.tor != nil && pending.files == nil {
		return pendingTorrentUpload{}, rerrors.Wrap(service_errors.ErrTorrentMetadataPending)
	}

	if mode != lookupPeek {
		s.deletePendingLocked(id)
	}

	return pending, nil
}

// deletePendingLocked removes an entry from the cache and, for a magnet,
// closes done and stops the expiry timer. The cache is the only place an
// entry can be removed from, and a removed entry is gone from the map, so done
// is closed exactly once. The caller must hold pendingUploadsMu and, for a
// magnet, release the client torrent with dropPendingTorrents afterwards.
func (s *TorrentService) deletePendingLocked(id string) {
	pending, ok := s.pendingUploads[id]
	if !ok {
		return
	}

	delete(s.pendingUploads, id)

	if pending.done != nil {
		close(pending.done)
	}
	if pending.expiryTimer != nil {
		pending.expiryTimer.Stop()
	}
}

// sweepExpiredPendingUploadsLocked removes cache entries past their TTL and
// returns them so the caller can release their client torrents once it has
// let go of pendingUploadsMu. Magnet entries also expire on their own timer;
// this sweep is the opportunistic backstop run from UploadTorrentFile and
// AddTorrentMagnet. The caller must already hold pendingUploadsMu.
func (s *TorrentService) sweepExpiredPendingUploadsLocked() []pendingTorrentUpload {
	now := time.Now()

	var expired []pendingTorrentUpload
	for id, pending := range s.pendingUploads {
		if now.After(pending.expiresAt) {
			s.deletePendingLocked(id)
			expired = append(expired, pending)
		}
	}

	return expired
}

// dropPendingTorrents releases the client torrent of every magnet entry in
// removed. Entries must already be out of the cache.
func (s *TorrentService) dropPendingTorrents(ctx context.Context, removed []pendingTorrentUpload) {
	for _, pending := range removed {
		s.dropPendingTorrent(ctx, pending)
	}
}

// dropPendingTorrent is dropPendingTorrents for a single entry; a .torrent
// entry holds nothing in the client, so it is a no-op for those.
func (s *TorrentService) dropPendingTorrent(ctx context.Context, pending pendingTorrentUpload) {
	if pending.tor == nil {
		return
	}
	s.dropUnusedTorrent(ctx, pending.infoHash)
}

// dropUnusedTorrent drops a torrent from the client unless something else
// still needs it: another live magnet entry, or an active job of any user (the
// client keeps one torrent per info hash, shared by all of them). Best-effort:
// a storage failure is logged and the torrent is left registered. Only the
// torrent is dropped - a pending magnet never downloaded payload, so there is
// no scratch dir to remove.
func (s *TorrentService) dropUnusedTorrent(ctx context.Context, infoHash string) {
	if s.torrentClient == nil {
		return
	}

	activeRows, err := s.torrentStorage.ListActive(ctx)
	if err != nil {
		log.Warn(ctx).Err(err).Str("info_hash", infoHash).Msg("could not check for active torrent jobs before dropping torrent")
		return
	}

	for _, row := range activeRows {
		if row.InfoHash == infoHash {
			return
		}
	}

	s.pendingUploadsMu.Lock()
	defer s.pendingUploadsMu.Unlock()

	// A timed-out entry's torrent is being dropped, so it doesn't hold it.
	for _, pending := range s.pendingUploads {
		if pending.tor != nil && !pending.timedOut && pending.infoHash == infoHash {
			return
		}
	}

	tor, ok := s.lookupTorrent(infoHash)
	if ok {
		tor.Drop()
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
			Supported: isSupportedUpload(filePath),
			Kind:      torrentFileKindOf(filePath),
		}
		entries = append(entries, entry)
	}

	return entries
}

// AddTorrentMagnet starts fetching a magnet link's metadata from peers and
// caches it under an opaque handle, like UploadTorrentFile does for a
// .torrent file; GetTorrentFile reports the file list once it arrives. If the
// caller already has an active job for the same info hash, nothing is added
// and that job's id is returned instead.
func (s *TorrentService) AddTorrentMagnet(ctx context.Context, magnetUri string) (domain.TorrentMagnetAdd, error) {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return domain.TorrentMagnetAdd{}, rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	if !uCtx.Permissions.CanUpload {
		return domain.TorrentMagnetAdd{}, rerrors.Wrap(user_errors.ErrPermissionDenied, "not allowed to upload file")
	}

	if s.torrentClient == nil {
		return domain.TorrentMagnetAdd{}, rerrors.Wrap(service_errors.ErrTorrentClientUnavailable)
	}

	magnet, err := metainfo.ParseMagnetUri(magnetUri)
	if err != nil {
		return domain.TorrentMagnetAdd{}, rerrors.Wrap(service_errors.ErrInvalidMagnet)
	}

	spec, err := torrent.TorrentSpecFromMagnetUri(magnetUri)
	if err != nil {
		return domain.TorrentMagnetAdd{}, rerrors.Wrap(service_errors.ErrInvalidMagnet)
	}

	infoHash := magnet.InfoHash.HexString()

	existing, err := s.torrentStorage.GetByUserAndInfoHash(ctx, uCtx.UserId, infoHash)
	if err != nil {
		return domain.TorrentMagnetAdd{}, rerrors.Wrap(err, "error checking for an existing torrent download")
	}
	if existing.Valid {
		alreadyAdded := domain.TorrentMagnetAdd{ExistingJobId: existing.V.Id}
		return alreadyAdded, nil
	}

	torrentName := magnet.DisplayName
	if torrentName == "" {
		torrentName = infoHash
	}

	id, expired, err := s.registerPendingMagnet(ctx, uCtx.UserId, spec, infoHash, torrentName)
	s.dropPendingTorrents(ctx, expired)
	if err != nil {
		return domain.TorrentMagnetAdd{}, rerrors.Wrap(err)
	}

	added := domain.TorrentMagnetAdd{UploadId: id}

	return added, nil
}

// registerPendingMagnet adds the magnet to the client and caches it under a
// new handle, arming the resolver and the expiry timer. Expired entries swept
// along the way are returned even on error so the caller can release them.
// The client call stays under the lock so a concurrent dropUnusedTorrent can't
// drop the torrent between AddTorrentSpec and the entry becoming visible.
func (s *TorrentService) registerPendingMagnet(
	ctx context.Context,
	userId int64,
	spec *torrent.TorrentSpec,
	infoHash string,
	torrentName string,
) (string, []pendingTorrentUpload, error) {
	// The resolver and the expiry timer outlive the request.
	detachedCtx := context.WithoutCancel(ctx)

	s.pendingUploadsMu.Lock()
	defer s.pendingUploadsMu.Unlock()

	expired := s.sweepExpiredPendingUploadsLocked()

	tor, _, err := s.torrentClient.AddTorrentSpec(spec)
	if err != nil {
		return "", expired, rerrors.Wrap(err, "error registering magnet with client")
	}

	id := uuid.NewString()
	done := make(chan struct{})

	pending := pendingTorrentUpload{
		userId:      userId,
		infoHash:    infoHash,
		torrentName: torrentName,
		expiresAt:   time.Now().Add(pendingTorrentUploadTTL),
		tor:         tor,
		done:        done,
		expiryTimer: time.AfterFunc(pendingTorrentUploadTTL, func() { s.expirePendingMagnet(detachedCtx, id) }),
	}
	s.pendingUploads[id] = pending

	go s.resolveMagnet(detachedCtx, id, tor, done)

	return id, expired, nil
}

// resolveMagnet waits for a magnet's info dict and publishes the file list on
// its cache entry, or marks the entry timed out and releases the torrent when
// peers don't deliver in time. It returns early once done is closed, i.e. the
// entry left the cache. ctx must not be tied to the originating request.
func (s *TorrentService) resolveMagnet(ctx context.Context, id string, tor *torrent.Torrent, done <-chan struct{}) {
	timeout := time.NewTimer(s.cfg.MetadataTimeout)
	defer timeout.Stop()

	select {
	case <-tor.GotInfo():
		s.publishMagnetInfo(id, tor)
	case <-timeout.C:
		s.timeOutMagnet(ctx, id)
	case <-done:
	}
}

func (s *TorrentService) publishMagnetInfo(id string, tor *torrent.Torrent) {
	info := tor.Info()

	s.pendingUploadsMu.Lock()
	defer s.pendingUploadsMu.Unlock()

	pending, ok := s.pendingUploads[id]
	if !ok {
		return
	}

	pending.files = torrentFileEntriesOf(info)
	pending.torrentName = info.BestName()
	s.pendingUploads[id] = pending
}

func (s *TorrentService) timeOutMagnet(ctx context.Context, id string) {
	s.pendingUploadsMu.Lock()

	pending, ok := s.pendingUploads[id]
	if !ok {
		s.pendingUploadsMu.Unlock()
		return
	}

	pending.timedOut = true
	s.pendingUploads[id] = pending
	s.pendingUploadsMu.Unlock()

	log.Warn(ctx).Str("info_hash", pending.infoHash).Msg("magnet metadata fetch timed out")

	s.dropUnusedTorrent(ctx, pending.infoHash)
}

// expirePendingMagnet is the TTL timer callback: it removes a magnet entry
// nobody came back for, so its torrent doesn't linger in the client until the
// next upload happens to sweep the cache.
func (s *TorrentService) expirePendingMagnet(ctx context.Context, id string) {
	s.pendingUploadsMu.Lock()
	pending, ok := s.pendingUploads[id]
	if ok {
		s.deletePendingLocked(id)
	}
	s.pendingUploadsMu.Unlock()

	if !ok {
		return
	}

	s.dropPendingTorrent(ctx, pending)
}

// DiscardTorrentFile forgets a pending upload or magnet handle without
// submitting it, releasing a magnet's client torrent unless something else
// still needs it.
func (s *TorrentService) DiscardTorrentFile(ctx context.Context, id string) error {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	pending, err := s.lookupPendingUpload(ctx, id, uCtx.UserId, lookupDiscard)
	if err != nil {
		return rerrors.Wrap(err, "error getting pending torrent upload")
	}

	s.dropPendingTorrent(ctx, pending)

	return nil
}
