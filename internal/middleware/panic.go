package middleware

import (
	"context"

	"github.com/sirupsen/logrus"
	"go.redsock.ru/rerrors"
	"google.golang.org/grpc"
)

func PanicInterceptor() grpc.ServerOption {
	return grpc.ChainUnaryInterceptor(
		func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp any, err error) {
			defer func() {
				r := recover()
				if r != nil {
					recovered, ok := r.(error)
					if !ok {
						recovered = rerrors.Wrap(err, "panic in grpc handler")
					}
					err = recovered
					logrus.WithError(err).Error("panic in grpc handler")
				}
			}()

			return handler(ctx, req)
		})
}
