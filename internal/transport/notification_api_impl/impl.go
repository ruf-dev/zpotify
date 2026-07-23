package notification_api_impl

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
	zpotify_api.UnimplementedNotificationAPIServer

	notificationService service.NotificationService
}

func New(srv service.Service) *Impl {
	return &Impl{
		UnimplementedNotificationAPIServer: zpotify_api.UnimplementedNotificationAPIServer{},
		notificationService:                srv.NotificationService(),
	}
}

func (impl *Impl) Register(server grpc.ServiceRegistrar) {
	zpotify_api.RegisterNotificationAPIServer(server, impl)
}

func (impl *Impl) Gateway(ctx context.Context, endpoint string, opts ...grpc.DialOption) (route string, handler http.Handler) {
	gwHttpMux := runtime.NewServeMux()

	err := zpotify_api.RegisterNotificationAPIHandlerFromEndpoint(
		ctx,
		gwHttpMux,
		endpoint,
		opts,
	)
	if err != nil {
		log.Error().Err(err).Msg("error registering grpc2http handler")
	}

	return "/api/notification/", gwHttpMux
}
