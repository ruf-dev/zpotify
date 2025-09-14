package middleware

import (
	"context"
	"strconv"

	"go.redsock.ru/rerrors"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"

	"go.zpotify.ru/zpotify/internal/service"
)

const (
	authHeader = "authorization"

	tgIdDebugHeader       = "Z-Tg-Id"
	tgUsernameDebugHeader = "Z-Tg-Username"
)

type authMiddleware struct {
	ignoredPaths   map[string]struct{}
	isDebugEnabled bool

	authService service.AuthService
	userService service.UserService
}

func (ac *authMiddleware) isIgnored(path string) bool {
	_, isIgnore := ac.ignoredPaths[path]
	return isIgnore
}

type authOption func(*authMiddleware)

func WithIgnoredPathAuthOption(p ...string) authOption {
	return func(a *authMiddleware) {
		a.ignoredPaths = map[string]struct{}{}
		for _, p := range p {
			a.ignoredPaths[p] = struct{}{}
		}
	}
}

func WithDebug(b bool) authOption {
	return func(a *authMiddleware) {
		a.isDebugEnabled = b
	}
}

func WithInterceptWithAuth(srv service.Service, opts ...authOption) grpc.ServerOption {
	ac := &authMiddleware{
		authService: srv.AuthService(),
		userService: srv.UserService(),
	}
	for _, opt := range opts {
		opt(ac)
	}

	return grpc.ChainUnaryInterceptor(func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp any, err error) {
		if ac.isIgnored(info.FullMethod) {
			return handler(ctx, req)
		}

		md, ok := metadata.FromIncomingContext(ctx)
		if !ok {
			return nil, status.Error(codes.FailedPrecondition, "error unmarshalling metadata from context")
		}

		ctxWithUser, err := ac.authWithSession(ctx, md)
		if err == nil {
			return handler(ctxWithUser, req)
		}

		if ac.isDebugEnabled {
			userCtx, debugErr := ac.authWithDebugHeaders(ctx, md)
			if debugErr != nil {
				return nil, rerrors.Wrap(err)
			}

			if userCtx != nil {
				return handler(WithUserContext(ctx, *userCtx), req)
			}
		}

		return nil, rerrors.Wrap(err)
	})
}

func (ac *authMiddleware) authWithSession(ctx context.Context, md metadata.MD) (context.Context, error) {
	auth := md.Get(authHeader)
	if len(auth) == 0 {
		return ctx, status.Error(codes.Unauthenticated, "error unmarshalling auth header")
	}

	tgId, err := ac.authService.AuthWithToken(ctx, auth[0])
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	uc := UserContext{
		TgUserId: tgId,
	}

	user, err := ac.userService.Get(ctx, uc.TgUserId)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	if !user.Permissions.EarlyAccess {
		return nil, status.Error(codes.PermissionDenied,
			"Service in early access. Ask administrator for Early access")
	}

	return WithUserContext(ctx, uc), nil
}

func (ac *authMiddleware) authWithDebugHeaders(ctx context.Context, md metadata.MD) (*UserContext, error) {
	tgIdStr := md.Get(tgIdDebugHeader)
	if len(tgIdStr) != 0 {
		tgId, err := strconv.ParseInt(tgIdStr[0], 10, 64)
		if err != nil {
			return nil, rerrors.Wrap(err, "expected telegram id to be an integer", codes.FailedPrecondition)
		}

		return &UserContext{
			TgUserId: tgId,
		}, nil
	}

	tgUserName := md.Get(tgUsernameDebugHeader)
	if len(tgUserName) != 0 {
		user, err := ac.userService.GetByUsername(ctx, tgUserName[0])
		if err != nil {
			return nil, rerrors.Wrap(err)
		}

		return &UserContext{TgUserId: user.TgId}, nil
	}

	return nil, rerrors.Wrap(rerrors.New("no debug header or auth token passed"), codes.FailedPrecondition)
}
