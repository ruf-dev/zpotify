package v1

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
)

// UploadTorrentFile parses a .torrent file and caches it under an opaque
// handle, without registering it with the bittorrent client or creating a
// torrent_downloads row.
//
// Not implemented yet - contract only.
func (s *TorrentService) UploadTorrentFile(ctx context.Context, torrentFileBytes []byte) (domain.TorrentFile, error) {
	return domain.TorrentFile{}, rerrors.Wrap(service_errors.ErrNotImplemented)
}

// GetTorrentFile returns a previously uploaded, not-yet-submitted torrent
// file by its opaque handle.
//
// Not implemented yet - contract only.
func (s *TorrentService) GetTorrentFile(ctx context.Context, id string) (domain.TorrentFile, error) {
	return domain.TorrentFile{}, rerrors.Wrap(service_errors.ErrNotImplemented)
}

// SubmitTorrentFile registers a previously uploaded torrent file for
// download, restricted to the given selected paths, and returns the id of
// the newly created tracking job.
//
// Not implemented yet - contract only.
func (s *TorrentService) SubmitTorrentFile(ctx context.Context, id string, folderName string, selectedPaths []string) (int64, error) {
	return 0, rerrors.Wrap(service_errors.ErrNotImplemented)
}
