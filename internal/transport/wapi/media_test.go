package wapi

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/service"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
)

type fakeMediaService struct {
	resolveFn func(ctx context.Context, filePath string) (domain.RemoteTarget, error)
	called    bool
}

func (f *fakeMediaService) Resolve(ctx context.Context, filePath string) (domain.RemoteTarget, error) {
	f.called = true
	return f.resolveFn(ctx, filePath)
}

type fakeStorageService struct {
	service.StorageService

	completeFn func(ctx context.Context, state, code string) error
	gotState   string
	gotCode    string
}

func (f *fakeStorageService) CompleteGoogleDriveAuth(ctx context.Context, state, code string) error {
	f.gotState = state
	f.gotCode = code
	return f.completeFn(ctx, state, code)
}

func newMediaServer(media service.MediaService) *Server {
	return &Server{mediaService: media}
}

func doGetMedia(srv *Server, method, target string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, target, nil)
	rec := httptest.NewRecorder()
	srv.GetMedia(rec, req)
	return rec
}

func Test_GetMedia_RemoteAudioSetsAccelRedirectHeaders(t *testing.T) {
	media := &fakeMediaService{
		resolveFn: func(_ context.Context, filePath string) (domain.RemoteTarget, error) {
			require.Equal(t, "Some_Artist/track-abcd1234.mp3", filePath)
			target := domain.RemoteTarget{Url: "https://bucket.example/obj?sig=1", AuthorizationHeader: "Bearer tok"}
			return target, nil
		},
	}

	rec := doGetMedia(newMediaServer(media), http.MethodGet, "/wapi/media/Some_Artist/track-abcd1234.mp3")

	require.Equal(t, http.StatusOK, rec.Code)
	require.Equal(t, "/_remote", rec.Header().Get("X-Accel-Redirect"))
	require.Equal(t, "https://bucket.example/obj?sig=1", rec.Header().Get("X-Remote-Url"))
	require.Equal(t, "Bearer tok", rec.Header().Get("X-Remote-Authorization"))
	require.Equal(t, "audio/mpeg", rec.Header().Get("Content-Type"))
	require.Empty(t, rec.Header().Get("Cache-Control"))
}

func Test_GetMedia_RemoteImageIsCacheableAndOmitsEmptyAuthorization(t *testing.T) {
	media := &fakeMediaService{
		resolveFn: func(_ context.Context, _ string) (domain.RemoteTarget, error) {
			return domain.RemoteTarget{Url: "https://bucket.example/cover.png"}, nil
		},
	}

	rec := doGetMedia(newMediaServer(media), http.MethodHead, "/wapi/media/a/cover.png")

	require.Equal(t, http.StatusOK, rec.Code)
	require.Equal(t, "image/png", rec.Header().Get("Content-Type"))
	require.Equal(t, "public, max-age=86400", rec.Header().Get("Cache-Control"))
	require.Empty(t, rec.Header().Values("X-Remote-Authorization"))
}

func Test_GetMedia_LocalFileIsNotFound(t *testing.T) {
	media := &fakeMediaService{
		resolveFn: func(_ context.Context, _ string) (domain.RemoteTarget, error) {
			return domain.RemoteTarget{}, rerrors.Wrap(service_errors.ErrNotFound)
		},
	}

	rec := doGetMedia(newMediaServer(media), http.MethodGet, "/wapi/media/a/b.mp3")

	require.Equal(t, http.StatusNotFound, rec.Code)
	require.Empty(t, rec.Header().Get("X-Accel-Redirect"))
}

func Test_GetMedia_ParentDirSegmentIsBadRequest(t *testing.T) {
	media := &fakeMediaService{}

	rec := doGetMedia(newMediaServer(media), http.MethodGet, "/wapi/media/a/../etc/passwd")

	require.Equal(t, http.StatusBadRequest, rec.Code)
	require.False(t, media.called)
}

func Test_GetMedia_EmptyPathIsBadRequest(t *testing.T) {
	media := &fakeMediaService{}

	rec := doGetMedia(newMediaServer(media), http.MethodGet, "/wapi/media/")

	require.Equal(t, http.StatusBadRequest, rec.Code)
	require.False(t, media.called)
}

func doGoogleDriveCallback(srv *Server, target string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodGet, target, nil)
	rec := httptest.NewRecorder()
	srv.GoogleDriveCallback(rec, req)
	return rec
}

func Test_GoogleDriveCallback_SuccessRedirectsToStorages(t *testing.T) {
	storageService := &fakeStorageService{
		completeFn: func(_ context.Context, _, _ string) error { return nil },
	}
	srv := &Server{storageService: storageService, publicBaseUrl: "https://zpotify.example/"}

	rec := doGoogleDriveCallback(srv, "/wapi/storage/google_drive/callback?code=c1&state=s1")

	require.Equal(t, http.StatusFound, rec.Code)
	require.Equal(t, "https://zpotify.example/storages", rec.Header().Get("Location"))
	require.Equal(t, "s1", storageService.gotState)
	require.Equal(t, "c1", storageService.gotCode)
}

func Test_GoogleDriveCallback_CompletionFailureRedirectsWithError(t *testing.T) {
	storageService := &fakeStorageService{
		completeFn: func(_ context.Context, _, _ string) error { return rerrors.New("boom") },
	}
	srv := &Server{storageService: storageService, publicBaseUrl: "https://zpotify.example"}

	rec := doGoogleDriveCallback(srv, "/wapi/storage/google_drive/callback?code=c1&state=s1")

	require.Equal(t, http.StatusFound, rec.Code)
	require.Equal(t, "https://zpotify.example/storages?error=google_drive_auth_failed", rec.Header().Get("Location"))
}

func Test_GoogleDriveCallback_ProviderErrorSkipsCompletion(t *testing.T) {
	storageService := &fakeStorageService{}
	srv := &Server{storageService: storageService, publicBaseUrl: "https://zpotify.example"}

	rec := doGoogleDriveCallback(srv, "/wapi/storage/google_drive/callback?error=access_denied&state=s1")

	require.Equal(t, http.StatusFound, rec.Code)
	require.Equal(t, "https://zpotify.example/storages?error=google_drive_auth_failed", rec.Header().Get("Location"))
	require.Empty(t, storageService.gotState)
}
