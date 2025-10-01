package files_cache

import (
	"io"
	"sync"
	"sync/atomic"

	"go.zpotify.ru/zpotify/internal/domain"
)

type File struct {
	buffer []byte // pre-allocated to full size
	size   int64  // known total size

	written int64 // number of bytes buffered so far
	mu      sync.Mutex
	cond    *sync.Cond
	closed  bool
	err     error

	isUploading   atomic.Bool
	isInitialized atomic.Bool

	SongInfo domain.Song
}

func NewFile() *File {
	f := &File{}

	f.cond = sync.NewCond(&f.mu)

	return f
}

// Stream returns a reader that starts from the beginning.
func (f *File) Stream() io.ReadCloser {
	return f.Get(0, f.size)
}

func (f *File) Get(start, end int64) io.ReadCloser {
	pr, pw := io.Pipe()

	go func() {
		defer pw.Close()

		// Clamp end to file size
		if end >= f.size || end == -1 {
			end = f.size - 1
		}
		pos := start

		for pos <= end {
			f.mu.Lock()
			// Wait until enough bytes are buffered or source is closed
			for pos >= f.written && !f.closed {
				f.cond.Wait()
			}

			// If we've buffered all data and source closed -> done
			if pos >= f.written && f.closed {
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
		f.closed = true
		f.mu.Unlock()
		f.cond.Broadcast()
		src.Close()
	}()

	if !f.isUploading.CompareAndSwap(false, true) {
		return
	}

	f.size = size
	f.buffer = make([]byte, size)

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

	// Case 1: fewer bytes than declared
	if f.written < size {
		f.mu.Lock()
		f.buffer = f.buffer[:f.written]
		f.size = f.written
		f.mu.Unlock()
		return
	}

	// Case 2: more bytes than declared
	// keep reading until EOF, growing buffer if needed
	for {
		n, err := src.Read(buf)
		if n > 0 {
			f.mu.Lock()
			if f.written+int64(n) > int64(len(f.buffer)) {
				newCap := int64(len(f.buffer)) * 2
				if newCap < f.written+int64(n) {
					newCap = f.written + int64(n)
				}
				newBuf := make([]byte, newCap)
				copy(newBuf, f.buffer)
				f.buffer = newBuf
			}

			copy(f.buffer[f.written:], buf[:n])
			f.written += int64(n)
			f.mu.Unlock()
			f.cond.Broadcast()
		}

		if err != nil {
			f.mu.Lock()
			f.size = f.written
			f.mu.Unlock()

			if err != io.EOF {
				f.err = err
			}
			return
		}
	}
}

func (f *File) Size() int64 {
	f.mu.Lock()
	defer f.mu.Unlock()
	return f.size
}

// IsInitializedSwap - if file is initialized - return true
// is not - sets flag to "initialized" and return false
func (f *File) IsInitializedSwap() bool {
	return !f.isInitialized.CompareAndSwap(false, true)
}
