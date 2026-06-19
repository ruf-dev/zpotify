package middleware

import (
	"context"
	"net/http"
	"time"

	"google.golang.org/grpc"

	"go.zpotify.ru/zpotify/internal/log"
)

func LogInterceptor() grpc.ServerOption {
	return grpc.ChainUnaryInterceptor(
		func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp any, err error) {
			resp, err = handler(ctx, req)

			logBase := log.Debug(ctx).
				Str("method", info.FullMethod).
				Any("request", req).
				Any("response", resp)

			if err != nil {
				logBase = logBase.Err(err)
			}

			defer func() {
				logBase.Msg("incoming GRPC request")
			}()

			return resp, err
		})
}

func LogWebMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rw := &loggingResponseWriter{ResponseWriter: w, status: http.StatusOK}

		ctx := log.WithContext(r.Context())
		r = r.WithContext(ctx)

		next.ServeHTTP(rw, r)

		log.Debug(ctx).
			Str("method", r.Method).
			Str("path", r.URL.Path).
			Str("remote", r.RemoteAddr).
			Int("status", rw.status).
			Dur("duration", time.Since(start)).
			Msg("incoming HTTP request")
	})
}

type loggingResponseWriter struct {
	http.ResponseWriter
	status int
}

func (rw *loggingResponseWriter) WriteHeader(code int) {
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
}
