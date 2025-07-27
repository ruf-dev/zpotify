package wapi

import (
	"net/http"

	"go.zpotify.ru/zpotify/internal/service"
)

type Server struct {
	audioService service.AudioService

	mux http.ServeMux
}

func New(audioService service.AudioService) http.Handler {
	srv := &Server{
		audioService: audioService,

		mux: http.ServeMux{},
	}

	srv.mux.HandleFunc("/wapi/audio/", srv.GetAudio)

	return &srv.mux
}
