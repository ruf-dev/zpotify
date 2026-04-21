package audio_parsers

import (
	"io"
	"time"

	"github.com/tcolgate/mp3"
	"go.redsock.ru/rerrors"
)

// MP3Info holds all extractable metadata from an MP3 file.
// Fields beyond Duration and SizeBytes are informational and not persisted.
type MP3Info struct {
	Duration  time.Duration
	SizeBytes int64

	// Per-frame header info (taken from the first valid frame)
	BitRate     int    // bits per second
	SampleRate  int    // Hz
	ChannelMode string // Stereo | JointStereo | DualChannel | Mono
	MPEGVersion string
	Layer       string
}

// ParseMP3 reads an MP3 stream and extracts metadata by decoding all frames.
func ParseMP3(r io.Reader) (MP3Info, error) {
	cr := &countingReader{r: r}
	dec := mp3.NewDecoder(cr)

	var info MP3Info
	var frame mp3.Frame
	var skipped int
	firstFrame := true

	for {
		err := dec.Decode(&frame, &skipped)
		if err == io.EOF {
			break
		}
		if err != nil {
			// tolerate individual corrupt frames
			continue
		}

		info.Duration += frame.Duration()

		if firstFrame {
			h := frame.Header()
			info.BitRate = int(h.BitRate())
			info.SampleRate = int(h.SampleRate())
			info.ChannelMode = channelModeString(h.ChannelMode())
			info.MPEGVersion = h.Version().String()
			info.Layer = h.Layer().String()
			firstFrame = false
		}
	}

	if firstFrame {
		return MP3Info{}, rerrors.New("no valid MP3 frames found")
	}

	info.SizeBytes = cr.n

	return info, nil
}

func channelModeString(m mp3.FrameChannelMode) string {
	switch m {
	case mp3.Stereo:
		return "Stereo"
	case mp3.JointStereo:
		return "JointStereo"
	case mp3.DualChannel:
		return "DualChannel"
	case mp3.SingleChannel:
		return "Mono"
	default:
		return "Unknown"
	}
}

type countingReader struct {
	r io.Reader
	n int64
}

func (c *countingReader) Read(p []byte) (int, error) {
	n, err := c.r.Read(p)
	c.n += int64(n)
	return n, err
}
