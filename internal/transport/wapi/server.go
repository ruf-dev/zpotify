package wapi

import (
	"net/http"

	"go.zpotify.ru/zpotify/internal/service"
)

type Server struct {
	audioService   service.AudioService
	fileService    service.FileService
	torrentService service.TorrentService

	mux http.ServeMux
}

func New(audioService service.AudioService, fileService service.FileService, torrentService service.TorrentService) http.Handler {
	srv := &Server{
		audioService:   audioService,
		fileService:    fileService,
		torrentService: torrentService,
	}

	srv.mux.HandleFunc("/wapi/audio", srv.GetAudio)
	srv.mux.HandleFunc("/wapi/song/cover", srv.GetCover)
	srv.mux.HandleFunc("/wapi/files/upload", srv.Upload)
	srv.mux.HandleFunc("/wapi/torrents/upload", srv.UploadTorrent)
	srv.mux.HandleFunc("/wapi/torrents/files", srv.UploadTorrentFile)

	handler := &srv.mux
	return handler
}
