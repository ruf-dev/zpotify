package torrent_sync

import (
	"context"
	"sync"
	"time"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/log"
	"go.zpotify.ru/zpotify/internal/storage"
)

// defaultPeriod is used when the configured sync period is not positive.
const defaultPeriod = 3 * time.Second

// TorrentHandle is the minimal view of one registered torrent this task needs.
// Byte counts are restricted to the torrent's audio files - the only files a
// torrent job ever downloads - so completion is not judged against payload
// that was deliberately skipped.
type TorrentHandle interface {
	AudioBytesCompleted() int64
	AudioBytesTotal() int64
}

// TorrentLookup resolves a tracked job's hex info hash to its live torrent.
// It is satisfied by the anacrolix client adapter and by test doubles.
type TorrentLookup interface {
	Torrent(infoHash string) (TorrentHandle, bool)
}

// Importer runs the import of a completed torrent. It is satisfied by
// *v1.TorrentService, whose ImportCompleted exists for this caller alone.
type Importer interface {
	ImportCompleted(ctx context.Context, row domain.TorrentDownload) error
}

// Task polls the active torrent jobs, writes their progress back to storage,
// and - on the tick that observes completion - runs the import inline.
type Task struct {
	ctx      context.Context
	stopFunc func()

	torrentStorage storage.TorrentDownloadStorage
	lookup         TorrentLookup
	importer       Importer

	once   sync.Once
	period time.Duration
}

func New(dataStorage storage.Storage, lookup TorrentLookup, importer Importer, period time.Duration) *Task {
	ctx, cancel := context.WithCancel(context.Background())

	if period <= 0 {
		period = defaultPeriod
	}

	return &Task{
		ctx:            ctx,
		stopFunc:       cancel,
		torrentStorage: dataStorage.TorrentDownloads(),
		lookup:         lookup,
		importer:       importer,
		period:         period,
	}
}

func (t *Task) Start() {
	go t.once.Do(func() {
		err := t.do()
		if err != nil {
			log.Error(t.ctx).Err(err).Msg("failed to sync torrent downloads")
		}

		ticker := time.NewTicker(t.period)
		for {
			select {
			case <-t.ctx.Done():
				ticker.Stop()
				return
			case <-ticker.C:
				err = t.do()
				if err != nil {
					log.Error(t.ctx).Err(err).Msg("failed to sync torrent downloads")
				}
			}
		}
	})
}

func (t *Task) Stop() {
	t.stopFunc()
}

func (t *Task) do() error {
	rows, err := t.torrentStorage.ListActive(t.ctx)
	if err != nil {
		return rerrors.Wrap(err, "error listing active torrent downloads")
	}

	for _, row := range rows {
		syncErr := t.syncRow(t.ctx, row)
		if syncErr != nil {
			log.Error(t.ctx).
				Err(syncErr).
				Int64("job_id", row.Id).
				Msg("failed to sync torrent download")
		}
	}

	return nil
}

// syncRow brings one job's stored progress up to date and, once all its audio
// bytes are present, flips it to importing and runs the import inline.
func (t *Task) syncRow(ctx context.Context, row domain.TorrentDownload) error {
	handle, ok := t.lookup.Torrent(row.InfoHash)
	if !ok {
		// The client does not know this torrent - most likely the process
		// restarted, which does not re-register in-flight torrents. The job
		// simply stops advancing; there is no crash recovery in this
		// iteration.
		log.Warn(ctx).
			Int64("job_id", row.Id).
			Str("info_hash", row.InfoHash).
			Msg("active torrent job has no registered torrent")
		return nil
	}

	downloaded := handle.AudioBytesCompleted()
	total := handle.AudioBytesTotal()

	err := t.torrentStorage.UpdateProgress(ctx, row.Id, downloaded, total)
	if err != nil {
		return rerrors.Wrap(err, "error updating torrent progress")
	}

	if !isComplete(downloaded, total) {
		return nil
	}

	err = t.torrentStorage.UpdateStatus(ctx, row.Id, domain.TorrentDownloadStatusImporting)
	if err != nil {
		return rerrors.Wrap(err, "error marking torrent download as importing")
	}

	row.Status = domain.TorrentDownloadStatusImporting
	row.DownloadedBytes = downloaded
	row.TotalBytes = total

	importErr := t.importer.ImportCompleted(ctx, row)
	if importErr == nil {
		return nil
	}

	err = t.torrentStorage.SetError(ctx, row.Id, importErr.Error())
	if err != nil {
		return rerrors.Wrap(err, "error saving torrent import error")
	}

	err = t.torrentStorage.UpdateStatus(ctx, row.Id, domain.TorrentDownloadStatusFailed)
	if err != nil {
		return rerrors.Wrap(err, "error marking torrent download as failed")
	}

	return rerrors.Wrap(importErr, "error importing completed torrent")
}

// isComplete reports whether every audio byte of a torrent is on disk. A
// zero/unknown total is never treated as complete, so a torrent whose info is
// not available yet cannot trigger an empty import.
func isComplete(downloaded int64, total int64) bool {
	if total <= 0 {
		return false
	}

	return downloaded >= total
}
