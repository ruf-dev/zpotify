package middleware

import (
	"context"
	"net/http"
	"strconv"

	"go.redsock.ru/rerrors"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
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

func GrpcAuthInterceptor(srv service.Service, opts ...authOption) grpc.ServerOption {
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
				return handler(user_context.WithUserContext(ctx, *userCtx), req)
			}
		}

		return nil, rerrors.Wrap(err)
	})
}

func HttpAuthMiddleware(srv service.Service, opts ...authOption) func(http.Handler) http.Handler {
	ac := &authMiddleware{
		authService: srv.AuthService(),
		userService: srv.UserService(),
	}
	for _, opt := range opts {
		opt(ac)
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if ac.isIgnored(r.URL.Path) {
				next.ServeHTTP(w, r)
				return
			}

			md := metadata.MD{}
			for k, v := range r.Header {
				md.Set(k, v...)
			}

			ctx := r.Context()
			ctxWithUser, err := ac.authWithSession(ctx, md)
			if err == nil {
				next.ServeHTTP(w, r.WithContext(ctxWithUser))
				return
			}

			if ac.isDebugEnabled {
				userCtx, debugErr := ac.authWithDebugHeaders(ctx, md)
				if debugErr == nil && userCtx != nil {
					next.ServeHTTP(w, r.WithContext(user_context.WithUserContext(ctx, *userCtx)))
					return
				}
			}

			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(err.Error()))
		})
	}
}

func (ac *authMiddleware) authWithSession(ctx context.Context, md metadata.MD) (context.Context, error) {
	auth := md.Get(authHeader)
	if len(auth) == 0 {
		return ctx, status.Error(codes.Unauthenticated, "error unmarshalling auth header")
	}

	userId, err := ac.authService.AuthWithToken(ctx, auth[0])
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	uc := user_context.UserContext{
		UserId: userId,
	}

	ctx = user_context.WithUserContext(ctx, uc)

	user, err := ac.userService.GetMe(ctx)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	if !user.Permissions.EarlyAccess {
		return nil, status.Error(codes.Unavailable,
			"Service in early access. Ask administrator for Early access")
	}

	uc.Permissions = user.Permissions

	return user_context.WithUserContext(ctx, uc), nil
}

func (ac *authMiddleware) authWithDebugHeaders(ctx context.Context, md metadata.MD) (*user_context.UserContext, error) {
	tgIdStr := md.Get(tgIdDebugHeader)
	if len(tgIdStr) != 0 {
		tgId, err := strconv.ParseInt(tgIdStr[0], 10, 64)
		if err != nil {
			return nil, rerrors.Wrap(err, "expected telegram id to be an integer", codes.FailedPrecondition)
		}

		return &user_context.UserContext{
			UserId: tgId,
			Permissions: domain.UserPermissions{
				CanUpload:   true,
				EarlyAccess: true,
			},
		}, nil
	}

	tgUserName := md.Get(tgUsernameDebugHeader)
	if len(tgUserName) != 0 {
		user, err := ac.userService.GetByUsername(ctx, tgUserName[0])
		if err != nil {
			return nil, rerrors.Wrap(err)
		}

		return &user_context.UserContext{UserId: user.Id}, nil
	}

	return nil, rerrors.New("no debug header or auth token passed", codes.Unauthenticated)
}
