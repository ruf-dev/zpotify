package audio_parsers

import (
	"encoding/binary"
	"io"
	"time"

	"go.redsock.ru/rerrors"
)

const (
	// m4aBoxHeaderSize is the size in bytes of a standard MP4 box header:
	// a 4-byte big-endian size followed by a 4-byte ASCII type.
	m4aBoxHeaderSize = 8

	// m4aLargeSizeFieldSize is the size in bytes of the optional 64-bit
	// "largesize" field that follows the header when size == 1.
	m4aLargeSizeFieldSize = 8

	// m4aBoxExtendsToEOF is a sentinel payload length meaning the box declared
	// size == 0, i.e. its payload runs to the end of the stream.
	m4aBoxExtendsToEOF int64 = -1

	m4aUint32Max uint32 = 0xFFFFFFFF
	m4aUint64Max uint64 = 0xFFFFFFFFFFFFFFFF
)

// ParseM4A reads an M4A (AAC-in-MP4) stream and extracts duration and size
// from the moov/mvhd box.
func ParseM4A(r io.Reader) (AudioInfo, error) {
	cr := &countingReader{r: r}

	boxType, payloadLen, err := readM4ABoxHeader(cr)
	if err != nil {
		return AudioInfo{}, rerrors.Wrap(err, "error reading ftyp box header")
	}
	if boxType != "ftyp" {
		return AudioInfo{}, rerrors.New("not an M4A file: missing ftyp box")
	}

	err = skipM4ABoxPayload(cr, payloadLen)
	if err != nil {
		return AudioInfo{}, rerrors.Wrap(err, "error skipping ftyp payload")
	}

	duration, err := findM4AMvhdDuration(cr)
	if err != nil {
		return AudioInfo{}, err
	}

	_, _ = io.Copy(io.Discard, cr)

	return AudioInfo{
		Duration:  duration,
		SizeBytes: cr.n,
	}, nil
}

// findM4AMvhdDuration walks top-level boxes looking for moov, then walks
// moov's children looking for mvhd, and returns the duration parsed from it.
func findM4AMvhdDuration(cr *countingReader) (time.Duration, error) {
	for {
		boxType, payloadLen, err := readM4ABoxHeader(cr)
		if err != nil {
			if err == io.EOF || err == io.ErrUnexpectedEOF {
				break
			}
			return 0, rerrors.Wrap(err, "error reading top-level box header")
		}

		if boxType != "moov" {
			err = skipM4ABoxPayload(cr, payloadLen)
			if err != nil {
				return 0, rerrors.Wrap(err, "error skipping top-level box")
			}
			continue
		}

		duration, found, err := findM4AMvhdInMoov(cr, payloadLen)
		if err != nil {
			return 0, err
		}
		if !found {
			return 0, rerrors.New("mvhd box not found inside moov box")
		}

		return duration, nil
	}

	return 0, rerrors.New("moov box not found")
}

// findM4AMvhdInMoov walks the children of a moov box (bounded to moovLen
// bytes, unless it extends to EOF) looking for mvhd.
func findM4AMvhdInMoov(cr *countingReader, moovLen int64) (duration time.Duration, found bool, err error) {
	var childReader io.Reader = cr
	if moovLen != m4aBoxExtendsToEOF {
		childReader = io.LimitReader(cr, moovLen)
	}

	for {
		boxType, payloadLen, err := readM4ABoxHeader(childReader)
		if err != nil {
			if err == io.EOF || err == io.ErrUnexpectedEOF {
				return 0, false, nil
			}
			return 0, false, rerrors.Wrap(err, "error reading moov child box header")
		}

		if boxType != "mvhd" {
			err = skipM4ABoxPayload(childReader, payloadLen)
			if err != nil {
				return 0, false, rerrors.Wrap(err, "error skipping moov child box")
			}
			continue
		}

		if payloadLen == m4aBoxExtendsToEOF {
			return 0, false, rerrors.New("invalid mvhd box: size extends to EOF")
		}

		payload := make([]byte, payloadLen)
		_, err = io.ReadFull(childReader, payload)
		if err != nil {
			return 0, false, rerrors.Wrap(err, "error reading mvhd payload")
		}

		duration, err = parseM4AMvhdPayload(payload)
		if err != nil {
			return 0, false, err
		}

		return duration, true, nil
	}
}

// parseM4AMvhdPayload parses an mvhd box payload (version byte + flags,
// followed by version-dependent fields) into a duration.
func parseM4AMvhdPayload(payload []byte) (time.Duration, error) {
	if len(payload) < 1 {
		return 0, rerrors.New("mvhd payload too short")
	}

	version := payload[0]

	var timescale uint32
	var duration uint64

	switch version {
	case 0:
		// version+flags(4) + creation_time(4) + modification_time(4) + timescale(4) + duration(4)
		const wantLen = 20
		if len(payload) < wantLen {
			return 0, rerrors.New("mvhd v0 payload too short")
		}
		timescale = binary.BigEndian.Uint32(payload[12:16])
		duration = uint64(binary.BigEndian.Uint32(payload[16:20]))

		if timescale == 0 {
			return 0, rerrors.New("invalid mvhd timescale: zero")
		}
		if uint32(duration) == m4aUint32Max {
			return 0, rerrors.New("mvhd duration unknown")
		}
	case 1:
		// version+flags(4) + creation_time(8) + modification_time(8) + timescale(4) + duration(8)
		const wantLen = 32
		if len(payload) < wantLen {
			return 0, rerrors.New("mvhd v1 payload too short")
		}
		timescale = binary.BigEndian.Uint32(payload[20:24])
		duration = binary.BigEndian.Uint64(payload[24:32])

		if timescale == 0 {
			return 0, rerrors.New("invalid mvhd timescale: zero")
		}
		if duration == m4aUint64Max {
			return 0, rerrors.New("mvhd duration unknown")
		}
	default:
		return 0, rerrors.New("unsupported mvhd version")
	}

	return time.Duration(duration) * time.Second / time.Duration(timescale), nil
}

// readM4ABoxHeader reads one MP4 box header from r and returns its type and
// payload length. A payloadLen of m4aBoxExtendsToEOF means the box declared
// size == 0, i.e. it has no fixed length and extends to the end of the stream.
//
// The raw error from the initial read is returned unwrapped so callers can
// distinguish a clean io.EOF (no more boxes) from a real read failure, same
// as the io.EOF handling in aac.go/mp3.go.
func readM4ABoxHeader(r io.Reader) (boxType string, payloadLen int64, err error) {
	header := make([]byte, m4aBoxHeaderSize)

	_, err = io.ReadFull(r, header)
	if err != nil {
		return "", 0, err
	}

	size := binary.BigEndian.Uint32(header[0:4])
	boxType = string(header[4:8])

	switch size {
	case 0:
		return boxType, m4aBoxExtendsToEOF, nil
	case 1:
		largeSizeBuf := make([]byte, m4aLargeSizeFieldSize)
		_, err = io.ReadFull(r, largeSizeBuf)
		if err != nil {
			return "", 0, rerrors.Wrap(err, "error reading box largesize")
		}

		largeSize := binary.BigEndian.Uint64(largeSizeBuf)
		if largeSize < uint64(m4aBoxHeaderSize+m4aLargeSizeFieldSize) {
			return "", 0, rerrors.New("invalid box largesize")
		}

		payloadLen = int64(largeSize) - m4aBoxHeaderSize - m4aLargeSizeFieldSize
		return boxType, payloadLen, nil
	default:
		if size < m4aBoxHeaderSize {
			return "", 0, rerrors.New("invalid box size")
		}

		payloadLen = int64(size) - m4aBoxHeaderSize
		return boxType, payloadLen, nil
	}
}

// skipM4ABoxPayload discards a box's payload. If payloadLen is
// m4aBoxExtendsToEOF, it drains r to the end of the stream instead.
func skipM4ABoxPayload(r io.Reader, payloadLen int64) error {
	if payloadLen == m4aBoxExtendsToEOF {
		_, err := io.Copy(io.Discard, r)
		if err != nil {
			return rerrors.Wrap(err, "error draining box that extends to EOF")
		}
		return nil
	}

	_, err := io.CopyN(io.Discard, r, payloadLen)
	if err != nil {
		return rerrors.Wrap(err, "error skipping box payload")
	}

	return nil
}
