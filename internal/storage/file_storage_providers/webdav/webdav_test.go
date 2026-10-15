package webdav

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"sync"
	"testing"

	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
)

type fakeServer struct {
	mu          sync.Mutex
	files       map[string][]byte
	collections map[string]bool
	mkcolCalls  []string
}

func newFakeServer() *fakeServer {
	return &fakeServer{
		files:       map[string][]byte{},
		collections: map[string]bool{},
	}
}

func (f *fakeServer) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	f.mu.Lock()
	defer f.mu.Unlock()

	if request.Header.Get("Authorization") != "Basic dXNlcjpwYXNz" {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	switch request.Method {
	case methodMkcol:
		f.mkcolCalls = append(f.mkcolCalls, request.URL.Path)
		if f.collections[request.URL.Path] {
			writer.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		f.collections[request.URL.Path] = true
		writer.WriteHeader(http.StatusCreated)
	case http.MethodPut:
		body, _ := io.ReadAll(request.Body)
		f.files[request.URL.Path] = body
		writer.WriteHeader(http.StatusCreated)
	case http.MethodGet:
		body, ok := f.files[request.URL.Path]
		if !ok {
			writer.WriteHeader(http.StatusNotFound)
			return
		}
		_, _ = writer.Write(body)
	case http.MethodDelete:
		_, ok := f.files[request.URL.Path]
		if !ok {
			writer.WriteHeader(http.StatusNotFound)
			return
		}
		delete(f.files, request.URL.Path)
		writer.WriteHeader(http.StatusNoContent)
	case methodCopy:
		body, ok := f.files[request.URL.Path]
		if !ok {
			writer.WriteHeader(http.StatusNotFound)
			return
		}
		dst, _ := url.Parse(request.Header.Get("Destination"))
		f.files[dst.Path] = body
		writer.WriteHeader(http.StatusNoContent)
	default:
		writer.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func newTestStorage(t *testing.T) (*Storage, *fakeServer) {
	t.Helper()

	fake := newFakeServer()
	server := httptest.NewServer(fake)
	t.Cleanup(server.Close)

	cfg := domain.WebdavConfig{
		Url:      server.URL + "/",
		Username: "user",
		Password: "pass",
		RootPath: "/zpotify",
	}

	st, err := New(cfg)
	require.NoError(t, err)

	typed, ok := st.(*Storage)
	require.True(t, ok)

	return typed, fake
}

func Test_Storage_RoundTrip(t *testing.T) {
	ctx := context.Background()
	st, fake := newTestStorage(t)

	err := st.Put(ctx, "Artist_Name/Title-1a2b3c4d.mp3", strings.NewReader("audio"))
	require.NoError(t, err)
	require.Equal(t, []string{"/zpotify", "/zpotify/Artist_Name"}, fake.mkcolCalls)

	reader, err := st.Get(ctx, "Artist_Name/Title-1a2b3c4d.mp3")
	require.NoError(t, err)
	got, err := io.ReadAll(reader)
	require.NoError(t, err)
	require.NoError(t, reader.Close())
	require.Equal(t, "audio", string(got))

	err = st.Copy(ctx, "Artist_Name/Title-1a2b3c4d.mp3", "other/dir/copy.mp3")
	require.NoError(t, err)
	require.Equal(t, []byte("audio"), fake.files["/zpotify/other/dir/copy.mp3"])

	err = st.Delete(ctx, "Artist_Name/Title-1a2b3c4d.mp3")
	require.NoError(t, err)
	require.NotContains(t, fake.files, "/zpotify/Artist_Name/Title-1a2b3c4d.mp3")
}

func Test_Delete_MissingIsNil(t *testing.T) {
	st, _ := newTestStorage(t)

	err := st.Delete(context.Background(), "nope/missing.mp3")
	require.NoError(t, err)
}

func Test_Get_MissingIsNotFound(t *testing.T) {
	st, _ := newTestStorage(t)

	_, err := st.Get(context.Background(), "nope/missing.mp3")
	require.ErrorIs(t, err, ErrNotFound)
}

func Test_Put_ChunkedBodyOfUnknownLength(t *testing.T) {
	st, fake := newTestStorage(t)

	var payload bytes.Buffer
	payload.WriteString("streamed")

	err := st.Put(context.Background(), "a.bin", io.MultiReader(&payload))
	require.NoError(t, err)
	require.Equal(t, []byte("streamed"), fake.files["/zpotify/a.bin"])
}

func Test_Resolve_BasicHeaderAndEscapedUrl(t *testing.T) {
	st, _ := newTestStorage(t)
	st.serverUrl = "https://dav.example.com"

	target, err := st.Resolve(context.Background(), "Artist Name/Title #1.mp3")
	require.NoError(t, err)
	require.Equal(t, "https://dav.example.com/zpotify/Artist%20Name/Title%20%231.mp3", target.Url)
	require.Equal(t, "Basic dXNlcjpwYXNz", target.AuthorizationHeader)
}

func Test_Probe_Succeeds(t *testing.T) {
	st, fake := newTestStorage(t)

	err := st.Probe(context.Background())
	require.NoError(t, err)
	require.Empty(t, fake.files)
}

func Test_New_RequiresUrl(t *testing.T) {
	_, err := New(domain.WebdavConfig{})
	require.ErrorIs(t, err, ErrUrlRequired)
}

func Test_Auth_WrongCredentialsFail(t *testing.T) {
	st, _ := newTestStorage(t)
	st.authHeader = "Basic wrong"

	err := st.Put(context.Background(), "a.bin", strings.NewReader("x"))
	require.ErrorIs(t, err, ErrUnexpectedStatus)
}
