package wapi

import (
	"context"
	stderrs "errors"
	"net/http"

	"github.com/rs/zerolog"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/log"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
)

func unwrapError(ctx context.Context, w http.ResponseWriter, err error) {
	if err == nil {
		return
	}
	log.AddField(ctx, func(e *zerolog.Event) *zerolog.Event {
		return e.Err(err)
	})
	if rerrors.Is(err, context.Canceled) {
		return
	}

	if stderrs.Is(err, service_errors.ErrNotFound) {
		w.WriteHeader(http.StatusNotFound)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	if stderrs.Is(err, service_errors.ErrPendingTrackLimitReached) {
		w.WriteHeader(http.StatusTooManyRequests)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	if stderrs.Is(err, service_errors.ErrSongSizeLimitExceeded) {
		w.WriteHeader(http.StatusTooManyRequests)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	if stderrs.Is(err, service_errors.ErrTotalUploadSizeLimitExceeded) {
		w.WriteHeader(http.StatusTooManyRequests)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	if stderrs.Is(err, service_errors.ErrUnsupportedUploadFormat) {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	w.WriteHeader(http.StatusInternalServerError)
	_, _ = w.Write([]byte(err.Error()))
}
