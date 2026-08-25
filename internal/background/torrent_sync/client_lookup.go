package torrent_sync

import (
	"github.com/anacrolix/torrent"
	"github.com/anacrolix/torrent/metainfo"

	"go.zpotify.ru/zpotify/internal/audio_parsers"
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

// torrentHandle reports byte counts over a torrent's audio files only, since
// non-audio files are given zero priority and are never downloaded.
type torrentHandle struct {
	tor *torrent.Torrent
}

func (h *torrentHandle) AudioBytesCompleted() int64 {
	var completed int64
	for _, file := range h.audioFiles() {
		completed += file.BytesCompleted()
	}

	return completed
}

func (h *torrentHandle) AudioBytesTotal() int64 {
	var total int64
	for _, file := range h.audioFiles() {
		total += file.Length()
	}

	return total
}

func (h *torrentHandle) audioFiles() []*torrent.File {
	files := h.tor.Files()

	audioFiles := make([]*torrent.File, 0, len(files))
	for _, file := range files {
		if audio_parsers.IsSupported(file.Path()) {
			audioFiles = append(audioFiles, file)
		}
	}

	return audioFiles
}
