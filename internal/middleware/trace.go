package middleware

import (
	"context"

	"github.com/rs/zerolog"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
	"google.golang.org/grpc"
)

const tracerName = "zpotify"

func withTraceFields(ctx context.Context, e *zerolog.Event) *zerolog.Event {
	sc := trace.SpanFromContext(ctx).SpanContext()
	if !sc.IsValid() {
		return e
	}
	return e.Str("trace_id", sc.TraceID().String()).Str("span_id", sc.SpanID().String())
}

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
