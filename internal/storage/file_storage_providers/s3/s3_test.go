package s3

import (
	"context"
	"net/url"
	"testing"

	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
)

func newTestConfig() domain.S3Config {
	return domain.S3Config{
		Endpoint:        "https://s3.example.com",
		Region:          "us-east-1",
		Bucket:          "music",
		AccessKeyId:     "AKIAFAKE",
		SecretAccessKey: "fakesecret",
	}
}

func Test_New_RejectsInvalidConfig(t *testing.T) {
	noBucket := newTestConfig()
	noBucket.Bucket = ""

	noEndpoint := newTestConfig()
	noEndpoint.Endpoint = ""

	_, err := New(context.Background(), noBucket)
	require.ErrorIs(t, err, ErrBucketRequired)

	_, err = New(context.Background(), noEndpoint)
	require.ErrorIs(t, err, ErrEndpointRequired)
}

func Test_Resolve_VirtualHostStyle(t *testing.T) {
	st, err := New(context.Background(), newTestConfig())
	require.NoError(t, err)

	target, err := st.Resolve(context.Background(), "Artist_Name/Title-1a2b3c4d.mp3")
	require.NoError(t, err)
	require.Empty(t, target.AuthorizationHeader)

	parsed, err := url.Parse(target.Url)
	require.NoError(t, err)
	require.Equal(t, "music.s3.example.com", parsed.Host)
	require.Equal(t, "/Artist_Name/Title-1a2b3c4d.mp3", parsed.Path)
	require.NotEmpty(t, parsed.Query().Get("X-Amz-Signature"))
}

func Test_Resolve_PathStyle(t *testing.T) {
	cfg := newTestConfig()
	cfg.IsPathStyle = true

	st, err := New(context.Background(), cfg)
	require.NoError(t, err)

	target, err := st.Resolve(context.Background(), "Artist_Name/Title-1a2b3c4d.mp3")
	require.NoError(t, err)

	parsed, err := url.Parse(target.Url)
	require.NoError(t, err)
	require.Equal(t, "s3.example.com", parsed.Host)
	require.Equal(t, "/music/Artist_Name/Title-1a2b3c4d.mp3", parsed.Path)
	require.NotEmpty(t, parsed.Query().Get("X-Amz-Signature"))
}
