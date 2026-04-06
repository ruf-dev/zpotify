package user_api_impl

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
	zpotify_api.UnimplementedUserAPIServer

	userService service.UserService
}

func New(srv service.Service) *Impl {
	return &Impl{
		zpotify_api.UnimplementedUserAPIServer{},

		srv.UserService(),
	}
}

func (impl *Impl) Register(server grpc.ServiceRegistrar) {
	zpotify_api.RegisterUserAPIServer(server, impl)
}

func (impl *Impl) Gateway(ctx context.Context, endpoint string, opts ...grpc.DialOption) (route string, handler http.Handler) {
	gwHttpMux := runtime.NewServeMux()

	err := zpotify_api.RegisterUserAPIHandlerFromEndpoint(
		ctx,
		gwHttpMux,
		endpoint,
		opts,
	)
	if err != nil {
		log.Error().Err(err).Msg("error registering grpc2http handler")
	}

	return "/api/user/", gwHttpMux
}
