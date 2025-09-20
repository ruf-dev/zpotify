package files_cache

import (
	"io"
	"sync"
)

type File struct {
	buffer []byte // pre-allocated to full size
	size   int64  // known total size

	written int64 // number of bytes buffered so far
	mu      sync.Mutex
	cond    *sync.Cond
	closed  bool
	err     error
}

// NewFile allocates a buffer of known size and starts reading src into it.
func NewFile(src io.ReadCloser, size int64) *File {
	f := &File{
		size:   size,
		buffer: make([]byte, size),
	}
	f.cond = sync.NewCond(&f.mu)
	go func() {
		defer func() {
			f.mu.Lock()
			f.closed = true
			f.mu.Unlock()
			f.cond.Broadcast()
			src.Close()
		}()

		buf := make([]byte, 32*1024)
		for {
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
				return
			}
		}
	}()

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
		if end >= f.size {
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

			chunk := f.buffer[pos : pos+toWrite]
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
