package wapi

import (
	"net/http"

	"go.zpotify.ru/zpotify/internal/service"
)

type Server struct {
	audioService   service.AudioService
	fileService    service.FileService
	torrentService service.TorrentService
	mediaService   service.MediaService
	storageService service.StorageService

	publicBaseUrl string

	mux http.ServeMux
}

func New(
	audioService service.AudioService,
	fileService service.FileService,
	torrentService service.TorrentService,
	mediaService service.MediaService,
	storageService service.StorageService,
	publicBaseUrl string,
) http.Handler {
	srv := &Server{
		audioService:   audioService,
		fileService:    fileService,
		torrentService: torrentService,
		mediaService:   mediaService,
		storageService: storageService,
		publicBaseUrl:  publicBaseUrl,
	}

	srv.mux.HandleFunc("/wapi/audio", srv.GetAudio)
	srv.mux.HandleFunc("/wapi/song/cover", srv.GetCover)
	srv.mux.HandleFunc("/wapi/files/upload", srv.Upload)
	srv.mux.HandleFunc("/wapi/torrents/upload", srv.UploadTorrent)
	srv.mux.HandleFunc("/wapi/torrents/files", srv.UploadTorrentFile)
	srv.mux.HandleFunc("/wapi/media/", srv.GetMedia)
	srv.mux.HandleFunc("/wapi/storage/google_drive/callback", srv.GoogleDriveCallback)

	handler := &srv.mux
	return handler
}
