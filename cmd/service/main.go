package main

import (
	"github.com/rs/zerolog/log"

	"go.zpotify.ru/zpotify/internal/app"
)

func main() {
	a, err := app.New()
	if err != nil {
		log.Fatal().Err(err).Msg("error initializing app")
	}

	err = a.Start()
	if err != nil {
		log.Fatal().Err(err).Msg("error starting app")
	}
}
