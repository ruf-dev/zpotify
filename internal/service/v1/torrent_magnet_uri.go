package v1

import (
	"github.com/anacrolix/torrent"
	"github.com/anacrolix/torrent/metainfo"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/service/service_errors"
)

// trackersOf flattens the announce-list tiers the client knows for tor into
// one de-duplicated list, keeping first-seen order. Never nil.
func trackersOf(tor *torrent.Torrent) []string {
	info := tor.Metainfo()

	return flattenAnnounceList(info.UpvertedAnnounceList())
}

// isPrivateTorrent reports the BEP 27 private flag; false while metadata is unknown.
func isPrivateTorrent(tor *torrent.Torrent) bool {
	info := tor.Info()
	if info == nil || info.Private == nil {
		return false
	}

	return *info.Private
}

func flattenAnnounceList(tiers [][]string) []string {
	trackers := []string{}
	seen := make(map[string]struct{})

	for _, tier := range tiers {
		for _, tracker := range tier {
			_, isSeen := seen[tracker]
			if tracker == "" || isSeen {
				continue
			}

			seen[tracker] = struct{}{}
			trackers = append(trackers, tracker)
		}
	}

	return trackers
}

func buildMagnetUri(infoHash string, name string, trackers []string) (string, error) {
	var hash metainfo.Hash

	err := hash.FromHexString(infoHash)
	if err != nil {
		return "", rerrors.Wrap(service_errors.ErrInvalidInfoHash, infoHash)
	}

	magnet := metainfo.Magnet{
		InfoHash:    hash,
		DisplayName: name,
		Trackers:    trackers,
	}

	return magnet.String(), nil
}
