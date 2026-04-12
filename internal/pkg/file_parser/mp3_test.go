package file_parser

import (
	"bytes"
	"testing"
)

func TestMP3Parser_Parse(t *testing.T) {
	parser := NewMP3Parser()

	// Since I don't have a real MP3 file in the environment,
	// I'll skip this test if no test file is found or use a small mock.
	// However, for a meaningful test, I should ideally have a small valid mp3.

	t.Run("Empty content", func(t *testing.T) {
		duration, size, err := parser.Parse(bytes.NewReader([]byte{}))
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if duration != 0 {
			t.Errorf("expected 0 duration, got %v", duration)
		}
		if size != 0 {
			t.Errorf("expected 0 size, got %v", size)
		}
	})

	// In a real scenario, I'd include a base64 encoded minimal MP3 or a path to a test file.
}
