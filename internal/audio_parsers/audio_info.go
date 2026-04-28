package audio_parsers

import (
	"io"
	"path"
	"strings"
	"time"

	"go.redsock.ru/rerrors"
)

var ErrUnsupportedFormat = rerrors.New("unsupported audio format")

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
