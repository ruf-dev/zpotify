package v1

import (
	"encoding/base64"
	"net/url"
	"testing"

	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/clients/prowlarr"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
)

func newTestBaseUrl(t *testing.T, raw string) *url.URL {
	t.Helper()

	parsed, err := url.Parse(raw)
	require.NoError(t, err)

	return parsed
}

func newMagnetRelease() prowlarr.Release {
	return prowlarr.Release{
		Title:       testMagnetAlbumName,
		MagnetUrl:   "magnet:?xt=urn:btih:abc&dn=Album",
		DownloadUrl: "http://host/1/download?link=x",
	}
}

func newDownloadRelease() prowlarr.Release {
	return prowlarr.Release{
		Title:       testMagnetAlbumName,
		DownloadUrl: "http://external-host:9696/12/download?apikey=secret&link=abc&file=Name",
	}
}

func newProxyMagnetUrlRelease() prowlarr.Release {
	return prowlarr.Release{
		Title:     testMagnetAlbumName,
		MagnetUrl: "http://host/7/download?link=zzz",
	}
}

func newInfoHashRelease() prowlarr.Release {
	return prowlarr.Release{
		Title:    "Pink Floyd & Co",
		InfoHash: "ABCDEF0123",
	}
}

func encodeId(payload string) string {
	return base64.RawURLEncoding.EncodeToString([]byte(payload))
}

func Test_TorrentSearchResultId_MagnetRoundTrip(t *testing.T) {
	release := newMagnetRelease()

	id, ok := torrentSearchResultIdOf(release, newTestBaseUrl(t, "http://prowlarr:9696"))
	require.True(t, ok)

	source, err := parseTorrentSearchResultId(id)
	require.NoError(t, err)
	require.Equal(t, release.MagnetUrl, source.magnetUri)
	require.Empty(t, source.downloadPathAndQuery)
}

func Test_TorrentSearchResultId_DownloadUrlStripsApiKeyAndHost(t *testing.T) {
	release := newDownloadRelease()

	id, ok := torrentSearchResultIdOf(release, newTestBaseUrl(t, "http://prowlarr:9696"))
	require.True(t, ok)

	source, err := parseTorrentSearchResultId(id)
	require.NoError(t, err)
	require.Empty(t, source.magnetUri)
	require.Equal(t, "/12/download?file=Name&link=abc", source.downloadPathAndQuery)
}

func Test_TorrentSearchResultId_BasePathPrefixIsStripped(t *testing.T) {
	release := prowlarr.Release{DownloadUrl: "http://host/prowlarr/12/download?link=abc"}

	id, ok := torrentSearchResultIdOf(release, newTestBaseUrl(t, "http://host/prowlarr/"))
	require.True(t, ok)

	source, err := parseTorrentSearchResultId(id)
	require.NoError(t, err)
	require.Equal(t, "/12/download?link=abc", source.downloadPathAndQuery)
}

func Test_TorrentSearchResultId_HttpMagnetUrlIsProxied(t *testing.T) {
	release := newProxyMagnetUrlRelease()

	id, ok := torrentSearchResultIdOf(release, newTestBaseUrl(t, "http://host"))
	require.True(t, ok)

	source, err := parseTorrentSearchResultId(id)
	require.NoError(t, err)
	require.Equal(t, "/7/download?link=zzz", source.downloadPathAndQuery)
}

func Test_TorrentSearchResultId_InfoHashBuildsMagnet(t *testing.T) {
	release := newInfoHashRelease()

	id, ok := torrentSearchResultIdOf(release, newTestBaseUrl(t, "http://host"))
	require.True(t, ok)

	source, err := parseTorrentSearchResultId(id)
	require.NoError(t, err)
	require.Equal(t, "magnet:?xt=urn:btih:abcdef0123&dn=Pink+Floyd+%26+Co", source.magnetUri)
}

func Test_TorrentSearchResultId_NoSourceIsRejected(t *testing.T) {
	release := prowlarr.Release{Title: "Nothing"}

	_, ok := torrentSearchResultIdOf(release, newTestBaseUrl(t, "http://host"))
	require.False(t, ok)
}

func Test_ParseTorrentSearchResultId_RejectsInvalidIds(t *testing.T) {
	cases := []struct {
		name string
		id   string
	}{
		{"bad base64", "!!!not-base64!!!"},
		{"unknown prefix", encodeId("x:magnet:?xt=urn:btih:abc")},
		{"api path", encodeId("p:/api/v1/indexer")},
		{"path traversal", encodeId("p:/1/download/../../api")},
		{"non numeric indexer", encodeId("p:/abc/download?link=1")},
		{"non magnet scheme", encodeId("m:http://evil/")},
		{"empty magnet", encodeId("m:")},
		{"empty proxy", encodeId("p:")},
		{"empty", ""},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			_, err := parseTorrentSearchResultId(tc.id)
			require.ErrorIs(t, err, service_errors.ErrInvalidTorrentSearchResultId)
		})
	}
}
