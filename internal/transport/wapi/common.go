package wapi

import (
	"context"
	stderrs "errors"
	"net/http"

	"github.com/rs/zerolog/log"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/user_errors"
)

func unwrapError(w http.ResponseWriter, err error) {
	if err == nil {
		log.Err(rerrors.New("wrapped nil error")).
			Msg("nil error passed to unwrapError function")
		return
	}

	if rerrors.Is(err, context.Canceled) {
		return
	}

	if stderrs.Is(err, user_errors.ErrNotFound) {
		w.WriteHeader(http.StatusNotFound)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	log.Err(err).
		Msg("unhandled error in wapi unwrapError")

	w.WriteHeader(http.StatusInternalServerError)
	_, _ = w.Write([]byte(err.Error()))
}
