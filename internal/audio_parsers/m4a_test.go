package audio_parsers

import (
	"bytes"
	"encoding/binary"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// buildBox prepends an 8-byte big-endian size + 4-byte ASCII type header to payload.
func buildBox(boxType string, payload []byte) []byte {
	size := uint32(m4aBoxHeaderSize + len(payload))

	sizeBuf := make([]byte, 4)
	binary.BigEndian.PutUint32(sizeBuf, size)

	box := make([]byte, 0, size)
	box = append(box, sizeBuf...)
	box = append(box, []byte(boxType)...)
	box = append(box, payload...)

	return box
}

// buildMvhd builds a valid mvhd box payload for version 0 or 1, padding the
// remaining fields (rate/volume/reserved/matrix/predefined/next_track_id)
// with zeros since the parser doesn't read them.
func buildMvhd(version int, timescale uint32, duration uint64) []byte {
	versionAndFlags := make([]byte, 4)
	versionAndFlags[0] = byte(version)

	timescaleBuf := make([]byte, 4)
	binary.BigEndian.PutUint32(timescaleBuf, timescale)

	payload := make([]byte, 0, 112)
	payload = append(payload, versionAndFlags...)

	switch version {
	case 0:
		creationAndModification := make([]byte, 8) // creation_time(4) + modification_time(4)
		durationBuf := make([]byte, 4)
		binary.BigEndian.PutUint32(durationBuf, uint32(duration))

		payload = append(payload, creationAndModification...)
		payload = append(payload, timescaleBuf...)
		payload = append(payload, durationBuf...)
	case 1:
		creationAndModification := make([]byte, 16) // creation_time(8) + modification_time(8)
		durationBuf := make([]byte, 8)
		binary.BigEndian.PutUint64(durationBuf, duration)

		payload = append(payload, creationAndModification...)
		payload = append(payload, timescaleBuf...)
		payload = append(payload, durationBuf...)
	}

	// rate(4) + volume(2) + reserved(10) + matrix(36) + predefined(24) + next_track_id(4)
	trailing := make([]byte, 80)
	payload = append(payload, trailing...)

	return payload
}

// buildFtypPayload builds a minimal ftyp payload: major brand (4 bytes),
// minor version (4 bytes), one compatible brand entry (4 bytes).
func buildFtypPayload() []byte {
	payload := make([]byte, 0, 12)
	payload = append(payload, []byte("M4A ")...) // major brand
	payload = append(payload, 0, 0, 0, 0)        // minor version
	payload = append(payload, []byte("M4A ")...) // compatible brand
	return payload
}

// buildValidM4A composes a minimal valid m4a byte sequence: ftyp, followed by
// a moov box wrapping the given mvhd payload.
func buildValidM4A(mvhdPayload []byte) []byte {
	ftyp := buildBox("ftyp", buildFtypPayload())
	mvhd := buildBox("mvhd", mvhdPayload)
	moov := buildBox("moov", mvhd)

	out := make([]byte, 0, len(ftyp)+len(moov))
	out = append(out, ftyp...)
	out = append(out, moov...)

	return out
}

func TestParseM4A_ValidMvhdV0(t *testing.T) {
	mvhd := buildMvhd(0, 1000, 180000)
	data := buildValidM4A(mvhd)

	info, err := ParseM4A(bytes.NewReader(data))
	require.NoError(t, err)
	assert.Equal(t, 3*time.Minute, info.Duration)
	assert.Equal(t, int64(len(data)), info.SizeBytes)
}

func TestParseM4A_ValidMvhdV1(t *testing.T) {
	mvhd := buildMvhd(1, 1000, 180000)
	data := buildValidM4A(mvhd)

	info, err := ParseM4A(bytes.NewReader(data))
	require.NoError(t, err)
	assert.Equal(t, 3*time.Minute, info.Duration)
	assert.Equal(t, int64(len(data)), info.SizeBytes)
}

func TestParseM4A_TruncatedInput(t *testing.T) {
	tests := []struct {
		name    string
		cutFrom int // cut the full byte slice to this many leading bytes
	}{
		{name: "truncated mid mvhd payload", cutFrom: -20},
		{name: "truncated mid box header", cutFrom: -3},
	}

	mvhd := buildMvhd(0, 1000, 180000)
	full := buildValidM4A(mvhd)

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cut := len(full) + tt.cutFrom
			require.Greater(t, cut, 0, "test setup: cut length must be positive")

			truncated := full[:cut]

			_, err := ParseM4A(bytes.NewReader(truncated))
			assert.Error(t, err)
		})
	}
}

func TestParseM4A_MoovWithoutMvhd(t *testing.T) {
	ftyp := buildBox("ftyp", buildFtypPayload())
	dummy := buildBox("free", []byte{1, 2, 3, 4})
	moov := buildBox("moov", dummy)

	data := make([]byte, 0, len(ftyp)+len(moov))
	data = append(data, ftyp...)
	data = append(data, moov...)

	_, err := ParseM4A(bytes.NewReader(data))
	require.Error(t, err)
	assert.Contains(t, err.Error(), "mvhd")
}

func TestParseM4A_NotAnM4AFile(t *testing.T) {
	tests := []struct {
		name string
		data []byte
	}{
		{
			name: "flac-style marker",
			data: []byte("fLaC" + "0123456789012345678901234567890123456789"),
		},
		{
			name: "box with wrong top-level type",
			data: buildBox("junk", []byte{1, 2, 3, 4}),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := ParseM4A(bytes.NewReader(tt.data))
			require.Error(t, err)
			assert.Contains(t, err.Error(), "not an M4A file")
		})
	}
}

func TestParseM4A_ZeroTimescale(t *testing.T) {
	mvhd := buildMvhd(0, 0, 1000)
	data := buildValidM4A(mvhd)

	_, err := ParseM4A(bytes.NewReader(data))
	require.Error(t, err)
	assert.Contains(t, err.Error(), "timescale")
}

func TestReadM4ABoxHeader_LargeSize(t *testing.T) {
	payload := []byte("0123456789abcdef") // 16 bytes payload
	largeSize := uint64(m4aBoxHeaderSize + m4aLargeSizeFieldSize + len(payload))

	header := make([]byte, 0, 16+len(payload))
	header = append(header, 0, 0, 0, 1) // size == 1 signals a largesize field follows
	header = append(header, []byte("test")...)

	largeSizeBuf := make([]byte, 8)
	binary.BigEndian.PutUint64(largeSizeBuf, largeSize)
	header = append(header, largeSizeBuf...)
	header = append(header, payload...)

	r := bytes.NewReader(header)

	boxType, payloadLen, err := readM4ABoxHeader(r)
	require.NoError(t, err)
	assert.Equal(t, "test", boxType)
	assert.Equal(t, int64(len(payload)), payloadLen)

	// Confirm the reader is positioned exactly at the start of the payload,
	// proving the largesize math didn't desync the stream.
	remaining := make([]byte, payloadLen)
	_, err = r.Read(remaining)
	require.NoError(t, err)
	assert.Equal(t, payload, remaining)
	assert.Equal(t, 0, r.Len(), "reader should be fully consumed")
}
