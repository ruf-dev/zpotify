package zpotify_api_impl

import (
	"context"
	"net/http"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/rs/zerolog/log"
	"google.golang.org/grpc"

	"go.zpotify.ru/zpotify/internal/service"
	"go.zpotify.ru/zpotify/pkg/zpotify_api"
)

type Impl struct {
	zpotify_api.UnimplementedZpotifyAPIServer
	zpotify_api.UnimplementedUserAPIServer

	audioService service.AudioService
	userService  service.UserService
	authService  service.AuthService
}

func New(srv service.Service) *Impl {
	return &Impl{
		audioService: srv.AudioService(),
		userService:  srv.UserService(),
		authService:  srv.AuthService(),
	}
}

func (impl *Impl) Register(server grpc.ServiceRegistrar) {
	zpotify_api.RegisterZpotifyAPIServer(server, impl)
	zpotify_api.RegisterUserAPIServer(server, impl)
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

	err = zpotify_api.RegisterUserAPIHandlerFromEndpoint(
		ctx,
		gwHttpMux,
		endpoint,
		opts,
	)
	if err != nil {
		log.Error().Err(err).Msg("error registering grpc2http handler")
	}

	return "/api/", gwHttpMux
}
