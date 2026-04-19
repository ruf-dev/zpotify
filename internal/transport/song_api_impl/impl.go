package song_api_impl

import (
	"context"
	"net/http"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/rs/zerolog/log"
	"google.golang.org/grpc"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/service"
)

type Impl struct {
	zpotify_api.UnimplementedSongAPIServer

	audioService service.AudioService
}

func New(srv service.Service) *Impl {
	return &Impl{
		UnimplementedSongAPIServer: zpotify_api.UnimplementedSongAPIServer{},
		audioService:               srv.AudioService(),
	}
}

func (impl *Impl) Register(server grpc.ServiceRegistrar) {
	zpotify_api.RegisterSongAPIServer(server, impl)
}

func (impl *Impl) Gateway(ctx context.Context, endpoint string, opts ...grpc.DialOption) (route string, handler http.Handler) {
	gwHttpMux := runtime.NewServeMux()

	err := zpotify_api.RegisterSongAPIHandlerFromEndpoint(
		ctx,
		gwHttpMux,
		endpoint,
		opts,
	)
	if err != nil {
		log.Error().Err(err).Msg("error registering grpc2http handler")
	}

	return "/api/song/", gwHttpMux
}
