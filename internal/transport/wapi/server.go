package wapi

import (
	"net/http"

	"go.zpotify.ru/zpotify/internal/service"
)

type Server struct {
	audioService service.AudioService
	fileService  service.FileService

	mux http.ServeMux
}

func New(audioService service.AudioService, fileService service.FileService) http.Handler {
	srv := &Server{
		audioService: audioService,
		fileService:  fileService,

		mux: http.ServeMux{},
	}

	srv.mux.HandleFunc("/wapi/audio", srv.GetAudio)
	srv.mux.HandleFunc("/api/files/upload", srv.Upload)

	return &srv.mux
}
