package middleware

import (
	"context"
	"net/http"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"google.golang.org/grpc"
)

type logContextKey struct{}

type LogFieldFn func(*zerolog.Event) *zerolog.Event

func AddLogField(ctx context.Context, fn LogFieldFn) {
	ptr, ok := ctx.Value(logContextKey{}).(*[]LogFieldFn)
	if !ok || ptr == nil {
		return
	}
	*ptr = append(*ptr, fn)
}

func withLogFields(ctx context.Context) context.Context {
	fns := make([]LogFieldFn, 0)
	return context.WithValue(ctx, logContextKey{}, &fns)
}

func applyLogFields(ctx context.Context, e *zerolog.Event) *zerolog.Event {
	ptr, ok := ctx.Value(logContextKey{}).(*[]LogFieldFn)
	if !ok || ptr == nil {
		return e
	}
	for _, fn := range *ptr {
		e = fn(e)
	}
	return e
}

func LogInterceptor() grpc.ServerOption {
	return grpc.ChainUnaryInterceptor(
		func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp any, err error) {
			logBase := log.Debug().
				Str("method", info.FullMethod).
				Any("request", req)

			resp, err = handler(ctx, req)
			if err != nil {
				logBase = logBase.Err(err)
			}

			logBase = logBase.Any("response", resp)
			logBase = withTraceFields(ctx, logBase)

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

		ctx := withLogFields(r.Context())
		r = r.WithContext(ctx)

		next.ServeHTTP(rw, r)

		logEvent := log.Debug().
			Str("method", r.Method).
			Str("path", r.URL.Path).
			Str("remote", r.RemoteAddr).
			Int("status", rw.status).
			Dur("duration", time.Since(start))

		logEvent = withTraceFields(ctx, logEvent)
		logEvent = applyLogFields(ctx, logEvent)
		logEvent.Msg("incoming HTTP request")
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
