package files_cache

import (
	"io"
	"sync"
	"sync/atomic"

	"github.com/rs/zerolog/log"

	"go.zpotify.ru/zpotify/internal/domain"
)

type File struct {
	buffer []byte // pre-allocated to full size
	size   atomic.Int64

	written  int64 // number of bytes buffered so far
	mu       sync.Mutex
	cond     *sync.Cond
	finished bool
	err      error

	isInitialized   atomic.Bool
	readyToDownload sync.WaitGroup

	SongInfo domain.Song
}

func NewFile() *File {
	f := &File{}

	f.cond = sync.NewCond(&f.mu)

	f.readyToDownload.Add(1)

	return f
}

// Stream returns a reader that starts from the beginning.
func (f *File) Stream() io.ReadCloser {
	return f.Get(0, f.size.Load())
}

func (f *File) Get(start, end int64) io.ReadCloser {
	f.readyToDownload.Wait()

	pr, pw := io.Pipe()

	go func() {
		defer func() {
			err := pw.Close()
			if err != nil {
				log.Err(err).Msg("error closing pipe writer")
			}
		}()

		size := f.size.Load()

		// Clamp end to file size
		if end >= size || end == -1 {
			end = size - 1
		}
		pos := start

		for pos <= end {
			f.mu.Lock()
			// Wait until enough bytes are buffered or source is finished
			for pos >= f.written && !f.finished {
				f.cond.Wait()
			}

			// If we've buffered all data and source finished -> done
			if pos >= f.written && f.finished {
				f.mu.Unlock()
				return
			}

			// Determine how many bytes we can write safely now
			avail := f.written - pos
			remaining := end - pos + 1 // inclusive
			toWrite := avail
			if remaining < toWrite {
				toWrite = remaining
			}

			chunk := f.buffer[pos:min(pos+toWrite, int64(len(f.buffer)))]
			pos += toWrite
			f.mu.Unlock()

			// Write chunk to pipe
			if _, err := pw.Write(chunk); err != nil {
				return
			}
		}
	}()

	return pr
}

func (f *File) Upload(src io.ReadCloser, size int64) {
	defer func() {
		f.mu.Lock()
		f.finished = true
		f.mu.Unlock()
		f.cond.Broadcast()

		err := src.Close()
		if err != nil {
			log.Err(err).Msg("failed to close file when uploading to cache")
		}

		if f.err != nil {
			log.Err(f.err).Msg("failure during Upload to cache happened")
		}
	}()

	f.size.Swap(size)

	f.buffer = make([]byte, size)

	f.readyToDownload.Done()

	buf := make([]byte, 32*1024)
	// Main loop: expect declared size to match
	for f.written < size {
		n, err := src.Read(buf)
		if n > 0 {
			f.mu.Lock()
			copy(f.buffer[f.written:], buf[:n])
			f.written += int64(n)
			f.mu.Unlock()
			f.cond.Broadcast()
		}
		if err != nil {
			if err != io.EOF {
				f.err = err
			}
			break
		}
	}
}

func (f *File) Size() int64 {
	return f.size.Load()
}

// IsInitializedSwap - if file is initialized - return true
// is not - sets flag to "initialized" and return false
func (f *File) IsInitializedSwap() bool {
	return !f.isInitialized.CompareAndSwap(false, true)
}
