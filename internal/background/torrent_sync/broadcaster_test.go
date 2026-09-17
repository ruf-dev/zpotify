package torrent_sync

import (
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
)

func Test_Broadcaster_SingleSubscriber(t *testing.T) {
	b := NewBroadcaster()
	userID := int64(1)

	ch := b.Subscribe(userID)
	defer b.Unsubscribe(userID, ch)

	job := domain.TorrentDownload{
		Id:     1,
		UserId: userID,
		Status: domain.TorrentDownloadStatusDownloading,
	}

	b.Publish(job)

	timeout := time.NewTimer(100 * time.Millisecond)
	defer timeout.Stop()

	select {
	case received := <-ch:
		require.Equal(t, job, received)
	case <-timeout.C:
		t.Fatal("timeout waiting for published job")
	}
}

func Test_Broadcaster_MultipleSubscribers(t *testing.T) {
	b := NewBroadcaster()
	userID := int64(1)

	ch1 := b.Subscribe(userID)
	ch2 := b.Subscribe(userID)
	defer b.Unsubscribe(userID, ch1)
	defer b.Unsubscribe(userID, ch2)

	job := domain.TorrentDownload{
		Id:     1,
		UserId: userID,
		Status: domain.TorrentDownloadStatusDownloading,
	}

	b.Publish(job)

	timeout := time.NewTimer(100 * time.Millisecond)
	defer timeout.Stop()

	received1 := false
	received2 := false

collectLoop:
	for {
		select {
		case <-ch1:
			received1 = true
		case <-ch2:
			received2 = true
		case <-timeout.C:
			break collectLoop
		}

		if received1 && received2 {
			break
		}
	}

	require.True(t, received1, "first subscriber did not receive job")
	require.True(t, received2, "second subscriber did not receive job")
}

func Test_Broadcaster_UserIsolation(t *testing.T) {
	b := NewBroadcaster()
	user1ID := int64(1)
	user2ID := int64(2)

	ch1 := b.Subscribe(user1ID)
	ch2 := b.Subscribe(user2ID)
	defer b.Unsubscribe(user1ID, ch1)
	defer b.Unsubscribe(user2ID, ch2)

	job1 := domain.TorrentDownload{
		Id:     1,
		UserId: user1ID,
		Status: domain.TorrentDownloadStatusDownloading,
	}

	job2 := domain.TorrentDownload{
		Id:     2,
		UserId: user2ID,
		Status: domain.TorrentDownloadStatusDownloading,
	}

	b.Publish(job1)
	b.Publish(job2)

	timeout := time.NewTimer(100 * time.Millisecond)
	defer timeout.Stop()

	select {
	case received := <-ch1:
		require.Equal(t, int64(1), received.Id)
	case <-timeout.C:
		t.Fatal("user 1 timeout waiting for its job")
	}

	select {
	case received := <-ch2:
		require.Equal(t, int64(2), received.Id)
	case <-timeout.C:
		t.Fatal("user 2 timeout waiting for its job")
	}

	timeout.Reset(100 * time.Millisecond)

	select {
	case received := <-ch1:
		t.Fatalf("user 1 received job from different user: %v", received)
	case <-timeout.C:
		// Expected - user1 should not receive user2's job
	}

	timeout.Reset(100 * time.Millisecond)

	select {
	case received := <-ch2:
		t.Fatalf("user 2 received job from different user: %v", received)
	case <-timeout.C:
		// Expected - user2 should not receive user1's job
	}
}

func Test_Broadcaster_UnsubscribeStopsDelivery(t *testing.T) {
	broadcaster := NewBroadcaster()
	userID := int64(1)

	ch := broadcaster.Subscribe(userID)

	job1 := domain.TorrentDownload{
		Id:     1,
		UserId: userID,
		Status: domain.TorrentDownloadStatusDownloading,
	}

	broadcaster.Publish(job1)

	timeout := time.NewTimer(100 * time.Millisecond)
	defer timeout.Stop()

	select {
	case <-ch:
		// Expected
	case <-timeout.C:
		t.Fatal("timeout waiting for first job")
	}

	broadcaster.Unsubscribe(userID, ch)

	job2 := domain.TorrentDownload{
		Id:     2,
		UserId: userID,
		Status: domain.TorrentDownloadStatusDownloading,
	}

	broadcaster.Publish(job2)

	// After unsubscribe, the channel is closed, so it should return immediately.
	// The second publish should not have sent anything to the channel.
	// We verify this by checking that the channel is closed and empty.
	timeout.Reset(10 * time.Millisecond)

	select {
	case job, ok := <-ch:
		if ok {
			t.Fatalf("received job after unsubscribe: %v", job)
		}
		// Channel is closed, which is expected
	case <-timeout.C:
		t.Fatal("timeout - channel should be closed and immediately readable")
	}
}

func Test_Broadcaster_NoLeakOnConcurrentSubscribePublish(t *testing.T) {
	b := NewBroadcaster()
	var wg sync.WaitGroup

	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(userID int64) {
			defer wg.Done()

			ch := b.Subscribe(userID)
			defer b.Unsubscribe(userID, ch)

			job := domain.TorrentDownload{
				Id:     userID,
				UserId: userID,
				Status: domain.TorrentDownloadStatusDownloading,
			}

			b.Publish(job)

			timeout := time.NewTimer(100 * time.Millisecond)
			defer timeout.Stop()

			select {
			case <-ch:
			case <-timeout.C:
			}
		}(int64(i))
	}

	wg.Wait()
}
