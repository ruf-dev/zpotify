package middleware

import (
	"context"

	"go.opentelemetry.io/otel"
	"google.golang.org/grpc"
)

const tracerName = "zpotify"

func TraceInterceptor() grpc.ServerOption {
	tracer := otel.Tracer(tracerName)
	return grpc.ChainUnaryInterceptor(
		func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
			ctx, span := tracer.Start(ctx, info.FullMethod)
			defer span.End()
			return handler(ctx, req)
		},
	)
}
