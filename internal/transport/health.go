package transport

import (
	"context"
	"net"
	"net/http"
	"time"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/utils"
)

const waitUntilServingPollInterval = 100 * time.Millisecond

// LivezHandler always reports the process alive - no dependencies.
func LivezHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}
}

// ReadyzHandler reports whether the server is actually serving traffic.
func ReadyzHandler(isReady func() bool) http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		if isReady() {
			w.WriteHeader(http.StatusOK)
			return
		}

		w.WriteHeader(http.StatusServiceUnavailable)
	}
}

// WaitUntilServing polls addr's "/" route until it gets any HTTP response
// back (status code doesn't matter, only that the round trip completed),
// or returns ctx's error once it's done.
func WaitUntilServing(ctx context.Context, addr string) error {
	target := "http://" + dialableAddr(addr) + "/"
	client := &http.Client{Timeout: waitUntilServingPollInterval}

	for {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, target, nil)
		if err != nil {
			return rerrors.Wrap(err, "error building readiness probe request")
		}

		//nolint:bodyclose // closed below via utils.CloseWithLog
		resp, err := client.Do(req)
		if err == nil {
			utils.CloseWithLog(resp.Body, "readiness probe response body")
			return nil
		}

		select {
		case <-ctx.Done():
			return rerrors.Wrap(ctx.Err())
		case <-time.After(waitUntilServingPollInterval):
		}
	}
}

// dialableAddr rewrites an unspecified listen host (0.0.0.0, ::, or empty)
// to a loopback address a client can actually connect to.
func dialableAddr(addr string) string {
	host, port, err := net.SplitHostPort(addr)
	if err != nil {
		return addr
	}

	if host == "" || host == "0.0.0.0" || host == "::" {
		host = "127.0.0.1"
	}

	return net.JoinHostPort(host, port)
}
