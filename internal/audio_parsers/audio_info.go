package audio_parsers

import (
	"io"
	"path"
	"strings"
	"time"

	"go.redsock.ru/rerrors"
)

var ErrUnsupportedFormat = rerrors.New("unsupported audio format")

// supportedExtensions is the single source of truth for the audio formats the
// platform can parse. Keep the Parse switch below in sync with this set.
var supportedExtensions = map[string]struct{}{
	".mp3":  {},
	".flac": {},
	".aac":  {},
}

// IsSupported reports whether the file extension is a parsable audio format.
func IsSupported(filePath string) bool {
	ext := strings.ToLower(path.Ext(filePath))
	_, ok := supportedExtensions[ext]
	return ok
}

type AudioInfo struct {
	Duration  time.Duration
	SizeBytes int64
}

func Parse(filePath string, r io.Reader) (AudioInfo, error) {
	ext := strings.ToLower(path.Ext(filePath))
	switch ext {
	case ".mp3":
		info, err := ParseMP3(r)
		if err != nil {
			return AudioInfo{}, err
		}
		return AudioInfo{Duration: info.Duration, SizeBytes: info.SizeBytes}, nil
	case ".flac":
		return ParseFLAC(r)
	case ".aac":
		return ParseAAC(r)
	default:
		return AudioInfo{}, rerrors.Wrap(ErrUnsupportedFormat, ext)
	}
}
