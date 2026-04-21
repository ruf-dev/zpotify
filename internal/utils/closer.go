package utils

import (
	"io"

	"github.com/rs/zerolog/log"
)

func CloseWithLog(c io.Closer, subj string) {
	err := c.Close()
	if err != nil {
		log.Error().
			Err(err).
			Msg("error during sage closing")
	}
}
