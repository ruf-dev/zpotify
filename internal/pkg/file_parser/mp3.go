package file_parser

import (
	"bytes"
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

func (p *MP3Parser) Parse(content []byte) (time.Duration, int64, error) {
	r := bytes.NewReader(content)
	d := mp3.NewDecoder(r)
	var duration time.Duration
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
	}

	return duration, int64(len(content)), nil
}
