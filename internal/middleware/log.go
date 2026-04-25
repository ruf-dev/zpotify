package middleware

import (
	"context"
	"net/http"
	"time"

	"github.com/rs/zerolog/log"
	"google.golang.org/grpc"
)

func LogInterceptor() grpc.ServerOption {
	return grpc.ChainUnaryInterceptor(
		func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp any, err error) {
			logBase := log.Debug().
				Str("method", info.FullMethod).
				Any("request", req)

			defer func() {
				logBase.Msg("incoming GRPC request")
			}()

			resp, err = handler(ctx, req)
			if err != nil {
				logBase = logBase.Err(err)
			}

			logBase = logBase.Any("response", resp)

			return resp, err
		})
}

func LogWebMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rw := &loggingResponseWriter{ResponseWriter: w, status: http.StatusOK}

		next.ServeHTTP(rw, r)

		log.Debug().
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
