package audio_parsers

import (
	"io"
	"time"

	"go.redsock.ru/rerrors"
)

// adtsSampleRates maps the 4-bit sampling_frequency_index in an ADTS header to Hz.
var adtsSampleRates = [13]int{
	96000, 88200, 64000, 48000, 44100, 32000,
	24000, 22050, 16000, 12000, 11025, 8000, 7350,
}

// ParseAAC reads a raw AAC/ADTS stream and extracts duration and size.
func ParseAAC(r io.Reader) (AudioInfo, error) {
	cr := &countingReader{r: r}

	var totalSamples int64
	var sampleRate int

	// 9 bytes covers both the 7-byte (no CRC) and 9-byte (with CRC) ADTS header.
	buf := make([]byte, 9)

	for {
		_, err := io.ReadFull(cr, buf[:7])
		if err != nil {
			if err == io.EOF || err == io.ErrUnexpectedEOF {
				break
			}
			return AudioInfo{}, rerrors.Wrap(err, "error reading ADTS frame header")
		}

		// ADTS syncword: first 12 bits must all be 1.
		if buf[0] != 0xFF || (buf[1]&0xF0) != 0xF0 {
			return AudioInfo{}, rerrors.New("invalid ADTS syncword")
		}

		// ADTS header layout (7 bytes without CRC):
		//   byte 0:       syncword[11:4]
		//   byte 1:       syncword[3:0] | ID | Layer(2) | protection_absent
		//   byte 2:       profile(2) | sampling_frequency_index(4) | private | channel[2]
		//   byte 3:       channel[1:0] | orig | home | copyright_id | copyright_start | frame_length[12:11]
		//   byte 4:       frame_length[10:3]
		//   byte 5:       frame_length[2:0] | buffer_fullness[10:6]
		//   byte 6:       buffer_fullness[5:0] | number_of_raw_data_blocks_in_frame(2)
		protectionAbsent := buf[1] & 0x01
		headerSize := 7
		if protectionAbsent == 0 {
			headerSize = 9
			_, err = io.ReadFull(cr, buf[7:9])
			if err != nil {
				break
			}
		}

		sfreqIdx := (buf[2] >> 2) & 0x0F
		if int(sfreqIdx) >= len(adtsSampleRates) {
			return AudioInfo{}, rerrors.New("invalid ADTS sampling frequency index")
		}
		if sampleRate == 0 {
			sampleRate = adtsSampleRates[sfreqIdx]
		}

		frameLen := int(buf[3]&0x03)<<11 | int(buf[4])<<3 | int(buf[5])>>5
		numBlocks := int(buf[6]&0x03) + 1
		totalSamples += int64(numBlocks * 1024)

		skipBytes := int64(frameLen - headerSize)
		if skipBytes < 0 {
			return AudioInfo{}, rerrors.New("invalid ADTS frame length")
		}
		if skipBytes > 0 {
			_, err = io.CopyN(io.Discard, cr, skipBytes)
			if err != nil {
				if err == io.EOF {
					break
				}
				return AudioInfo{}, rerrors.Wrap(err, "error skipping ADTS frame body")
			}
		}
	}

	if sampleRate == 0 {
		return AudioInfo{}, rerrors.New("no valid ADTS frames found")
	}

	duration := time.Duration(totalSamples) * time.Second / time.Duration(sampleRate)

	return AudioInfo{
		Duration:  duration,
		SizeBytes: cr.n,
	}, nil
}
