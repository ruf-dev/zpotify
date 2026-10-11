package prowlarr

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
)

const testApiKey = "secret-key"

const searchFixture = `[
	{"guid":"g1","title":"Album One","size":1234,"indexer":"IdxA","publishDate":"2024-05-01T10:00:00Z",
	 "protocol":"torrent","seeders":7,"infoHash":"ABCDEF","magnetUrl":"magnet:?xt=urn:btih:abcdef","downloadUrl":"http://x/1/download?link=a"},
	{"guid":"g2","title":"Album Two","size":99,"indexer":"IdxB","publishDate":"2024-06-01T10:00:00Z",
	 "protocol":"usenet","seeders":null,"infoHash":null,"magnetUrl":null,"downloadUrl":"http://x/2/download?link=b"}
]`

func newTestClient(t *testing.T, handler http.HandlerFunc, pathPrefix string) *Client {
	t.Helper()

	server := httptest.NewServer(handler)
	t.Cleanup(server.Close)

	client, err := New(server.URL+pathPrefix, testApiKey)
	require.NoError(t, err)

	return client
}

func Test_Search_SendsApiKeyAndMapsReleases(t *testing.T) {
	var gotKey, gotCategories, gotQuery string
	client := newTestClient(t, func(w http.ResponseWriter, r *http.Request) {
		gotKey = r.Header.Get("X-Api-Key")
		gotCategories = r.URL.Query().Get("categories")
		gotQuery = r.URL.Query().Get("query")
		_, _ = w.Write([]byte(searchFixture))
	}, "")

	releases, err := client.Search(t.Context(), "pink floyd")
	require.NoError(t, err)

	require.Equal(t, testApiKey, gotKey)
	require.Equal(t, "3000", gotCategories)
	require.Equal(t, "pink floyd", gotQuery)
	require.Len(t, releases, 2)

	require.Equal(t, "Album One", releases[0].Title)
	require.Equal(t, int64(1234), releases[0].SizeBytes)
	require.Equal(t, "IdxA", releases[0].Indexer)
	require.Equal(t, "torrent", releases[0].Protocol)
	require.Equal(t, 2024, releases[0].PublishedAt.Year())
	require.NotNil(t, releases[0].Seeders)
	require.Equal(t, int64(7), *releases[0].Seeders)
	require.Equal(t, "ABCDEF", releases[0].InfoHash)

	require.Nil(t, releases[1].Seeders)
	require.Empty(t, releases[1].MagnetUrl)
}

func Test_Search_NonOkStatusErrorOmitsBody(t *testing.T) {
	client := newTestClient(t, func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte("sensitive-upstream-body"))
	}, "")

	_, err := client.Search(t.Context(), "q")
	require.ErrorIs(t, err, errUnexpectedStatus)
	require.NotContains(t, err.Error(), "sensitive-upstream-body")
	require.Contains(t, err.Error(), "500")
}

func Test_Search_HonoursBasePathPrefix(t *testing.T) {
	var gotPath string
	client := newTestClient(t, func(w http.ResponseWriter, r *http.Request) {
		gotPath = r.URL.Path
		_, _ = w.Write([]byte("[]"))
	}, "/prowlarr")

	_, err := client.Search(t.Context(), "q")
	require.NoError(t, err)
	require.Equal(t, "/prowlarr/api/v1/search", gotPath)
}

func Test_Ping_StatusHandling(t *testing.T) {
	cases := []struct {
		name    string
		status  int
		wantErr bool
	}{
		{"ok", http.StatusOK, false},
		{"unauthorized", http.StatusUnauthorized, true},
		{"server error", http.StatusInternalServerError, true},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			var gotPath, gotKey string
			client := newTestClient(t, func(w http.ResponseWriter, r *http.Request) {
				gotPath = r.URL.Path
				gotKey = r.Header.Get("X-Api-Key")
				w.WriteHeader(tc.status)
			}, "")

			err := client.Ping(t.Context())
			require.Equal(t, "/api/v1/system/status", gotPath)
			require.Equal(t, testApiKey, gotKey)
			if tc.wantErr {
				require.ErrorIs(t, err, errUnexpectedStatus)
				return
			}
			require.NoError(t, err)
		})
	}
}

func Test_Grab_RedirectToMagnet(t *testing.T) {
	client := newTestClient(t, func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "magnet:?xt=urn:btih:abc", http.StatusFound)
	}, "")

	grab, err := client.Grab(t.Context(), "/12/download?link=abc")
	require.NoError(t, err)
	require.Equal(t, "magnet:?xt=urn:btih:abc", grab.MagnetUri)
	require.Nil(t, grab.TorrentBytes)
}

func Test_Grab_RedirectToHttpIsRejected(t *testing.T) {
	client := newTestClient(t, func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "http://169.254.169.254/latest", http.StatusFound)
	}, "")

	_, err := client.Grab(t.Context(), "/12/download?link=abc")
	require.ErrorIs(t, err, errUnexpectedRedirect)
}

func Test_Grab_TorrentBytesWithApiKeyAppended(t *testing.T) {
	var gotApiKey, gotLink, gotFile, gotPath string
	client := newTestClient(t, func(w http.ResponseWriter, r *http.Request) {
		gotPath = r.URL.Path
		gotApiKey = r.URL.Query().Get("apikey")
		gotLink = r.URL.Query().Get("link")
		gotFile = r.URL.Query().Get("file")
		_, _ = w.Write([]byte("d8:announce0:e"))
	}, "/prowlarr")

	grab, err := client.Grab(t.Context(), "/12/download?link=abc&file=My+Name")
	require.NoError(t, err)

	require.Equal(t, "/prowlarr/12/download", gotPath)
	require.Equal(t, testApiKey, gotApiKey)
	require.Equal(t, "abc", gotLink)
	require.Equal(t, "My Name", gotFile)
	require.Equal(t, []byte("d8:announce0:e"), grab.TorrentBytes)
	require.Empty(t, grab.MagnetUri)
}

func Test_Grab_OversizedBodyIsRejected(t *testing.T) {
	client := newTestClient(t, func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte(strings.Repeat("a", maxTorrentBytes+1)))
	}, "")

	_, err := client.Grab(t.Context(), "/12/download?link=abc")
	require.ErrorIs(t, err, errTorrentTooLarge)
}

func Test_Grab_ErrorDoesNotLeakApiKey(t *testing.T) {
	server := httptest.NewServer(http.NotFoundHandler())
	baseUrl := server.URL
	server.Close()

	client, err := New(baseUrl, testApiKey)
	require.NoError(t, err)

	_, err = client.Grab(t.Context(), "/12/download?link=abc")
	require.Error(t, err)
	require.NotContains(t, err.Error(), testApiKey)
}
