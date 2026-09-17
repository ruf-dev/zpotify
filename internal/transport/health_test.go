package transport_test

import (
	"context"
	"net"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/transport"
)

func Test_LivezHandler_AlwaysReportsOk(t *testing.T) {
	handler := transport.LivezHandler()
	recorder := httptest.NewRecorder()

	handler(recorder, httptest.NewRequest(http.MethodGet, "/livez", nil))

	require.Equal(t, http.StatusOK, recorder.Code)
}

func Test_ReadyzHandler_ReflectsReadiness(t *testing.T) {
	cases := []struct {
		name       string
		isReady    bool
		wantStatus int
	}{
		{"not ready", false, http.StatusServiceUnavailable},
		{"ready", true, http.StatusOK},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			handler := transport.ReadyzHandler(func() bool { return tc.isReady })
			recorder := httptest.NewRecorder()

			handler(recorder, httptest.NewRequest(http.MethodGet, "/readyz", nil))

			require.Equal(t, tc.wantStatus, recorder.Code)
		})
	}
}

func Test_WaitUntilServing_ReturnsOnceServerIsServing(t *testing.T) {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	require.NoError(t, err)

	server := &http.Server{
		Handler: http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusOK)
		}),
	}
	go func() {
		_ = server.Serve(listener)
	}()
	defer func() {
		_ = server.Close()
	}()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = transport.WaitUntilServing(ctx, listener.Addr().String())
	require.NoError(t, err)
}

func Test_WaitUntilServing_ReturnsContextErrorWhenNothingIsListening(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	err := transport.WaitUntilServing(ctx, "127.0.0.1:1")

	require.Error(t, err)
}
