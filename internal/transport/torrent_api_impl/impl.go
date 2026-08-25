package torrent_api_impl

import (
	"context"
	"net/http"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/rs/zerolog/log"
	"google.golang.org/grpc"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/service"
)

type Impl struct {
	zpotify_api.UnimplementedTorrentAPIServer

	torrentService service.TorrentService
}

func New(srv service.Service) *Impl {
	return &Impl{
		torrentService: srv.TorrentService(),
	}
}

func (impl *Impl) Register(server grpc.ServiceRegistrar) {
	zpotify_api.RegisterTorrentAPIServer(server, impl)
}

func (impl *Impl) Gateway(ctx context.Context, endpoint string, opts ...grpc.DialOption) (route string, handler http.Handler) {
	gwHttpMux := runtime.NewServeMux()

	err := zpotify_api.RegisterTorrentAPIHandlerFromEndpoint(
		ctx,
		gwHttpMux,
		endpoint,
		opts,
	)
	if err != nil {
		log.Error().Err(err).Msg("error registering grpc2http handler")
	}

	return "/api/torrents/", gwHttpMux
}

// toTorrentJob converts a stored torrent download into its API shape.
func toTorrentJob(row domain.TorrentDownload) *zpotify_api.TorrentJob {
	importedFiles := domain.DecodeTorrentImportedFiles(row.ImportedFiles)

	apiFiles := make([]*zpotify_api.ImportedFile, 0, len(importedFiles))
	for _, file := range importedFiles {
		apiFile := &zpotify_api.ImportedFile{
			TorrentPath: file.TorrentPath,
			FileId:      file.FileId,
			Status:      file.Status,
			Error:       file.Error,
		}
		apiFiles = append(apiFiles, apiFile)
	}

	job := &zpotify_api.TorrentJob{
		Id:              row.Id,
		TorrentName:     row.TorrentName,
		FolderName:      row.FolderName,
		Status:          string(row.Status),
		TotalBytes:      row.TotalBytes,
		DownloadedBytes: row.DownloadedBytes,
		ImportedFiles:   apiFiles,
		Error:           row.Error,
	}

	return job
}
