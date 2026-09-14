package torrent_sync

import (
	"github.com/anacrolix/torrent"
	"github.com/anacrolix/torrent/metainfo"

	"go.zpotify.ru/zpotify/internal/domain"
)

// clientLookup adapts the anacrolix bittorrent client to TorrentLookup.
type clientLookup struct {
	client *torrent.Client
}

// NewClientLookup wraps the shared bittorrent client so the sync task depends
// only on the handful of numbers it actually reads.
func NewClientLookup(client *torrent.Client) TorrentLookup {
	lookup := &clientLookup{client: client}
	return lookup
}

func (c *clientLookup) Torrent(infoHash string) (TorrentHandle, bool) {
	if c.client == nil {
		return nil, false
	}

	var hash metainfo.Hash

	err := hash.FromHexString(infoHash)
	if err != nil {
		return nil, false
	}

	tor, ok := c.client.Torrent(hash)
	if !ok {
		return nil, false
	}

	handle := &torrentHandle{tor: tor}

	return handle, true
}

// torrentHandle reports progress over the files actually selected for
// download (a non-zero piece priority), not just anything with an audio
// extension - a submitted job may also select a supported cover image
// alongside its audio files, and everything left at zero priority is never
// downloaded regardless of its format.
type torrentHandle struct {
	tor *torrent.Torrent
}

// FileProgress reports each selected file's own downloaded/total byte
// counts, so a caller can render or sum them independently.
func (h *torrentHandle) FileProgress() []domain.TorrentFileProgress {
	files := h.selectedFiles()

	progress := make([]domain.TorrentFileProgress, 0, len(files))
	for _, file := range files {
		fileProgress := domain.TorrentFileProgress{
			Path:            file.Path(),
			DownloadedBytes: file.BytesCompleted(),
			TotalBytes:      file.Length(),
		}
		progress = append(progress, fileProgress)
	}

	return progress
}

func (h *torrentHandle) selectedFiles() []*torrent.File {
	files := h.tor.Files()

	selected := make([]*torrent.File, 0, len(files))
	for _, file := range files {
		if file.Priority() != torrent.PiecePriorityNone {
			selected = append(selected, file)
		}
	}

	return selected
}
