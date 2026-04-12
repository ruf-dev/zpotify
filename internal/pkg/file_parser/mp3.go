package file_parser

import (
	"errors"
	"io"
	"time"

	"github.com/tcolgate/mp3"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
)

type MP3Parser struct{}

func NewMP3Parser() domain.FileParser {
	return &MP3Parser{}
}

func (p *MP3Parser) Parse(reader io.Reader) (time.Duration, int64, error) {
	d := mp3.NewDecoder(reader)
	var duration time.Duration
	var size int64
	for {
		var f mp3.Frame
		var skipped int
		err := d.Decode(&f, &skipped)
		if err != nil {
			if errors.Is(err, io.EOF) {
				break
			}
			return 0, 0, rerrors.Wrap(err, "error decoding mp3 frame")
		}
		duration += f.Duration()
		size += int64(f.Size())
		size += int64(skipped)
	}

	return duration, size, nil
}
