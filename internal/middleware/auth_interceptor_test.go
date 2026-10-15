package middleware

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func Test_AuthMiddleware_IsIgnored_PrefixOption(t *testing.T) {
	ac := &authMiddleware{}
	WithIgnoredPathAuthOption("/wapi/song/cover")(ac)
	WithIgnoredPathPrefixAuthOption("/wapi/media/")(ac)

	cases := []struct {
		name string
		path string
		want bool
	}{
		{"exact path", "/wapi/song/cover", true},
		{"path under prefix", "/wapi/media/artist/a.mp3", true},
		{"prefix without trailing segment", "/wapi/media", false},
		{"unrelated path", "/wapi/audio", false},
		{"exact path is not a prefix", "/wapi/song/cover/extra", false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			require.Equal(t, tc.want, ac.isIgnored(tc.path))
		})
	}
}
