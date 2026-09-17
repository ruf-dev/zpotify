package zpotify_api_impl

import (
	"context"
	"net/http"
	"time"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/rs/zerolog/log"
	"google.golang.org/grpc"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/service"
)

type Impl struct {
	zpotify_api.UnimplementedZpotifyAPIServer

	audioService    service.AudioService
	userService     service.UserService
	authService     service.AuthService
	playlistService service.PlaylistService

	version   string
	devMode   bool
	startedAt time.Time
}

func New(srv service.Service, version string, devMode bool, startedAt time.Time) *Impl {
	return &Impl{
		audioService:    srv.AudioService(),
		userService:     srv.UserService(),
		authService:     srv.AuthService(),
		playlistService: srv.PlaylistService(),

		version:   version,
		devMode:   devMode,
		startedAt: startedAt,
	}
}

func (impl *Impl) Register(server grpc.ServiceRegistrar) {
	zpotify_api.RegisterZpotifyAPIServer(server, impl)
}

func (impl *Impl) Gateway(ctx context.Context, endpoint string, opts ...grpc.DialOption) (route string, handler http.Handler) {
	gwHttpMux := runtime.NewServeMux()

	err := zpotify_api.RegisterZpotifyAPIHandlerFromEndpoint(
		ctx,
		gwHttpMux,
		endpoint,
		opts,
	)
	if err != nil {
		log.Error().Err(err).Msg("error registering grpc2http handler")
	}

	return "/api/version", gwHttpMux
}
