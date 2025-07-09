package wapi

import (
	"net/http"
)

type Server struct {
	mux http.ServeMux
}

func New() http.Handler {
	srv := &Server{
		mux: http.ServeMux{},
	}

	srv.mux.HandleFunc("/wapi/audio/", srv.GetAudio)

	return &srv.mux
}
