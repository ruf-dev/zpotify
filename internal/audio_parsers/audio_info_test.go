package audio_parsers

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIsSupported(t *testing.T) {
	tests := []struct {
		name     string
		filePath string
		want     bool
	}{
		{name: "mp3", filePath: "track.mp3", want: true},
		{name: "flac", filePath: "track.flac", want: true},
		{name: "aac", filePath: "track.aac", want: true},
		{name: "m4a", filePath: "track.m4a", want: true},
		{name: "uppercase extension", filePath: "track.M4A", want: true},
		{name: "with directory prefix", filePath: "/uploads/user/track.m4a", want: true},
		{name: "unsupported extension", filePath: "track.wav", want: false},
		{name: "no extension", filePath: "track", want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := IsSupported(tt.filePath)
			assert.Equal(t, tt.want, got)
		})
	}
}
