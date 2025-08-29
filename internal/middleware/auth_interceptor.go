package middleware

import (
	"context"

	"go.redsock.ru/rerrors"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"

	"go.zpotify.ru/zpotify/internal/service"
)

const (
	authHeader = "authorization"
)

type authConfig struct {
	ignoredPaths map[string]struct{}
}

func (a *authConfig) isIgnored(path string) bool {
	_, isIgnore := a.ignoredPaths[path]
	return isIgnore
}

type authOption func(*authConfig)

func WithIgnoredPathAuthOption(p ...string) authOption {
	return func(a *authConfig) {
		a.ignoredPaths = map[string]struct{}{}
		for _, p := range p {
			a.ignoredPaths[p] = struct{}{}
		}
	}
}

func WithInterceptWithAuth(srv service.Service, opts ...authOption) grpc.ServerOption {
	ac := &authConfig{}
	for _, opt := range opts {
		opt(ac)
	}

	return grpc.ChainUnaryInterceptor(
		func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp any, err error) {
			if ac.isIgnored(info.FullMethod) {
				return handler(ctx, req)
			}

			md, ok := metadata.FromIncomingContext(ctx)
			if !ok {
				return nil, status.Error(codes.FailedPrecondition, "error unmarshalling metadata from context")
			}

			auth := md.Get(authHeader)
			if len(auth) == 0 {
				return nil, status.Error(codes.Unauthenticated, "error unmarshalling auth header")
			}

			tgId, err := srv.AuthService().AuthWithToken(ctx, auth[0])
			if err != nil {
				return nil, rerrors.Wrap(err)
			}

			uc := UserContext{
				TgUserId: tgId,
			}

			ctx = WithUserContext(ctx, uc)

			return handler(ctx, req)
		})
}
