package utils

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const testFolderName = "My Album"

func TestSanitizeFolderName(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name      string
		input     string
		want      string
		wantError bool
	}{
		{
			name:  "normal folder name",
			input: testFolderName,
			want:  testFolderName,
		},
		{
			name:  "leading and trailing whitespace is trimmed",
			input: "  " + testFolderName + "  ",
			want:  testFolderName,
		},
		{
			name:      "empty string is rejected",
			input:     "",
			wantError: true,
		},
		{
			name:      "whitespace only is rejected",
			input:     "   ",
			wantError: true,
		},
		{
			name:      "single dot is rejected",
			input:     ".",
			wantError: true,
		},
		{
			name:      "double dot is rejected",
			input:     "..",
			wantError: true,
		},
		{
			name:      "traversal segments are rejected",
			input:     "../../etc",
			wantError: true,
		},
		{
			name:      "forward slash is rejected",
			input:     "foo/bar",
			wantError: true,
		},
		{
			name:      "backslash is rejected",
			input:     "foo\\bar",
			wantError: true,
		},
		{
			name:      "NUL byte is rejected",
			input:     "foo\x00bar",
			wantError: true,
		},
		{
			name:      "control character is rejected",
			input:     "foo\tbar",
			wantError: true,
		},
		{
			name:  "name at the length limit is accepted",
			input: strings.Repeat("a", maxFolderNameBytes),
			want:  strings.Repeat("a", maxFolderNameBytes),
		},
		{
			name:      "name over the length limit is rejected",
			input:     strings.Repeat("a", maxFolderNameBytes+1),
			wantError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := SanitizeFolderName(tt.input)
			if tt.wantError {
				require.Error(t, err)
				return
			}

			require.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}
