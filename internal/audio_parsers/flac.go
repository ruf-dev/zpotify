package audio_parsers

import (
	"io"
	"time"

	"go.redsock.ru/rerrors"
)

// ParseFLAC reads a FLAC stream and extracts duration and size from the STREAMINFO block.
func ParseFLAC(r io.Reader) (AudioInfo, error) {
	cr := &countingReader{r: r}

	marker := make([]byte, 4)
	_, err := io.ReadFull(cr, marker)
	if err != nil {
		return AudioInfo{}, rerrors.Wrap(err, "error reading FLAC marker")
	}
	if string(marker) != "fLaC" {
		return AudioInfo{}, rerrors.New("not a FLAC file")
	}

	blockHeader := make([]byte, 4)
	for {
		_, err = io.ReadFull(cr, blockHeader)
		if err != nil {
			return AudioInfo{}, rerrors.Wrap(err, "error reading FLAC block header")
		}

		isLast := blockHeader[0]&0x80 != 0
		blockType := blockHeader[0] & 0x7F
		blockLen := int(blockHeader[1])<<16 | int(blockHeader[2])<<8 | int(blockHeader[3])

		if blockType == 0 { // STREAMINFO
			data := make([]byte, blockLen)
			_, err = io.ReadFull(cr, data)
			if err != nil {
				return AudioInfo{}, rerrors.Wrap(err, "error reading STREAMINFO block")
			}

			// STREAMINFO layout (big-endian bit stream):
			//   bits  0–15: min block size
			//   bits 16–31: max block size
			//   bits 32–55: min frame size
			//   bits 56–79: max frame size
			//   bits 80–99: sample rate (20 bits)
			//   bits 100–102: channels minus one
			//   bits 103–107: bits per sample minus one
			//   bits 108–143: total samples (36 bits)
			sampleRate := int(data[10])<<12 | int(data[11])<<4 | int(data[12])>>4
			if sampleRate == 0 {
				return AudioInfo{}, rerrors.New("invalid FLAC sample rate")
			}

			totalSamples := int64(data[13]&0x0F)<<32 |
				int64(data[14])<<24 |
				int64(data[15])<<16 |
				int64(data[16])<<8 |
				int64(data[17])

			duration := time.Duration(totalSamples) * time.Second / time.Duration(sampleRate)

			_, _ = io.Copy(io.Discard, cr)

			return AudioInfo{
				Duration:  duration,
				SizeBytes: cr.n,
			}, nil
		}

		_, err = io.CopyN(io.Discard, cr, int64(blockLen))
		if err != nil {
			return AudioInfo{}, rerrors.Wrap(err, "error skipping FLAC metadata block")
		}

		if isLast {
			break
		}
	}

	return AudioInfo{}, rerrors.New("STREAMINFO block not found in FLAC file")
}
