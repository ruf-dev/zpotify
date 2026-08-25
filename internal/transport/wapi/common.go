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

func unwrapError(ctx context.Context, writer http.ResponseWriter, err error) {
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
		writer.WriteHeader(http.StatusNotFound)
		_, _ = writer.Write([]byte(err.Error()))
		return
	}

	if stderrs.Is(err, service_errors.ErrPendingTrackLimitReached) {
		writer.WriteHeader(http.StatusTooManyRequests)
		_, _ = writer.Write([]byte(err.Error()))
		return
	}

	if stderrs.Is(err, service_errors.ErrSongSizeLimitExceeded) {
		writer.WriteHeader(http.StatusTooManyRequests)
		_, _ = writer.Write([]byte(err.Error()))
		return
	}

	if stderrs.Is(err, service_errors.ErrTotalUploadSizeLimitExceeded) {
		writer.WriteHeader(http.StatusTooManyRequests)
		_, _ = writer.Write([]byte(err.Error()))
		return
	}

	if stderrs.Is(err, service_errors.ErrUnsupportedUploadFormat) {
		writer.WriteHeader(http.StatusBadRequest)
		_, _ = writer.Write([]byte(err.Error()))
		return
	}

	if stderrs.Is(err, service_errors.ErrTorrentConcurrencyLimitReached) {
		writer.WriteHeader(http.StatusTooManyRequests)
		_, _ = writer.Write([]byte(err.Error()))
		return
	}

	if stderrs.Is(err, service_errors.ErrInvalidTorrentFile) {
		writer.WriteHeader(http.StatusBadRequest)
		_, _ = writer.Write([]byte(err.Error()))
		return
	}

	if stderrs.Is(err, service_errors.ErrTorrentHasNoAudioFiles) {
		writer.WriteHeader(http.StatusBadRequest)
		_, _ = writer.Write([]byte(err.Error()))
		return
	}

	if stderrs.Is(err, service_errors.ErrTorrentClientUnavailable) {
		writer.WriteHeader(http.StatusServiceUnavailable)
		_, _ = writer.Write([]byte(err.Error()))
		return
	}

	writer.WriteHeader(http.StatusInternalServerError)
	_, _ = writer.Write([]byte(err.Error()))
}
