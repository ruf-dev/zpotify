package middleware

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"strings"
	"time"

	"google.golang.org/grpc"

	"go.zpotify.ru/zpotify/internal/log"
)

func LogInterceptor() grpc.ServerOption {
	return grpc.ChainUnaryInterceptor(
		func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp any, err error) {
			resp, err = handler(ctx, req)

			logBase := log.Debug(ctx).
				Str("path", info.FullMethod).
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

// LogStreamInterceptor mirrors LogInterceptor for server-streaming RPCs. There's no
// single request/response to log for a stream, so it logs the method path and the
// terminal error (if any) once the stream ends.
func LogStreamInterceptor() grpc.ServerOption {
	return grpc.ChainStreamInterceptor(
		func(srv any, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
			err := handler(srv, ss)

			logBase := log.Debug(ss.Context()).
				Str("path", info.FullMethod)

			if err != nil {
				logBase = logBase.Err(err)
			}

			logBase.Msg("incoming GRPC stream")

			return err
		})
}

func LogWebMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		start := time.Now()
		rw := &loggingResponseWriter{ResponseWriter: w, status: http.StatusOK}

		ctx := log.WithContext(req.Context())
		req = req.WithContext(ctx)

		path := req.URL.Path
		logReqBody := !strings.Contains(path, "/upload")
		logRespBody := !strings.Contains(path, "/audio")

		rw.captureBody = logRespBody

		var reqBody []byte
		if logReqBody && req.Body != nil {
			body, err := io.ReadAll(req.Body)
			if err == nil {
				reqBody = body
				req.Body = io.NopCloser(bytes.NewReader(body))
			}
		}

		next.ServeHTTP(rw, req)

		event := log.Debug(ctx).
			Str("method", req.Method).
			Str("path", path).
			Str("remote", req.RemoteAddr).
			Int("status", rw.status).
			Dur("duration", time.Since(start))

		if logReqBody && len(reqBody) > 0 {
			event = event.Bytes("request_body", reqBody)
		}
		if logRespBody && rw.body.Len() > 0 {
			event = event.Bytes("response_body", rw.body.Bytes())
		}

		event.Msg("incoming HTTP request")
	})
}

type loggingResponseWriter struct {
	http.ResponseWriter
	status      int
	body        bytes.Buffer
	captureBody bool
}

func (rw *loggingResponseWriter) WriteHeader(code int) {
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
}

func (rw *loggingResponseWriter) Write(b []byte) (int, error) {
	if rw.captureBody {
		rw.body.Write(b)
	}
	return rw.ResponseWriter.Write(b)
}
