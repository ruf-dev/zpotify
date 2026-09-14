package torrent_sync

import (
	"sync"

	"go.zpotify.ru/zpotify/internal/domain"
)

// Broadcaster manages subscriptions to torrent job updates, keyed by user ID.
// It is safe for concurrent use.
type Broadcaster struct {
	mu          sync.RWMutex
	subscribers map[int64]map[chan domain.TorrentDownload]struct{}
}

// NewBroadcaster creates a new in-process broadcaster for torrent updates.
func NewBroadcaster() *Broadcaster {
	return &Broadcaster{
		subscribers: make(map[int64]map[chan domain.TorrentDownload]struct{}),
	}
}

// Subscribe returns a channel that will receive torrent job updates for the given user.
// The channel is buffered with a size of 1 to avoid blocking on sends.
// The caller is responsible for closing the channel by calling Unsubscribe.
func (b *Broadcaster) Subscribe(userID int64) chan domain.TorrentDownload {
	b.mu.Lock()
	defer b.mu.Unlock()

	ch := make(chan domain.TorrentDownload, 1)
	if b.subscribers[userID] == nil {
		b.subscribers[userID] = make(map[chan domain.TorrentDownload]struct{})
	}
	b.subscribers[userID][ch] = struct{}{}

	return ch
}

// Unsubscribe removes a channel from the broadcaster's subscription list.
// It safely closes the channel without blocking.
func (b *Broadcaster) Unsubscribe(userID int64, ch chan domain.TorrentDownload) {
	b.mu.Lock()
	defer b.mu.Unlock()

	if subs, ok := b.subscribers[userID]; ok {
		delete(subs, ch)
		if len(subs) == 0 {
			delete(b.subscribers, userID)
		}
	}
	close(ch)
}

// Publish sends a torrent job update to all subscribers of that user.
// It does not block if no subscribers are listening.
func (b *Broadcaster) Publish(job domain.TorrentDownload) {
	b.mu.Lock()
	defer b.mu.Unlock()

	subs, ok := b.subscribers[job.UserId]
	if !ok {
		return
	}

	for ch := range subs {
		select {
		case ch <- job:
		default:
			// Channel full; skip this send to avoid blocking.
			// The subscriber will receive the next update instead.
		}
	}
}
