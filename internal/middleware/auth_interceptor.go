package middleware

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/rs/zerolog"
	"go.redsock.ru/rerrors"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/log"
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
				ctx = user_context.WithUserContext(ctx, *userCtx)
				log.AddField(ctx, func(e *zerolog.Event) *zerolog.Event {
					return e.Int64("user_id", userCtx.UserId)
				})

				return handler(ctx, req)
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
				k = strings.TrimPrefix(k, "Grpc-Metadata-")
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
					ctx = user_context.WithUserContext(ctx, *userCtx)
					log.AddField(ctx, func(e *zerolog.Event) *zerolog.Event {
						return e.Int64("user_id", userCtx.UserId)
					})
					next.ServeHTTP(w, r.WithContext(ctx))
					return
				}
			}

			writeError(err, w)
		})
	}
}

func writeError(err error, w http.ResponseWriter) {
	rerr := &rerrors.Error{}
	if errors.As(err, rerr) {
		rerr.HttpStatus(w)
		return
	}

	w.WriteHeader(http.StatusInternalServerError)
	_, _ = w.Write([]byte(err.Error()))
}

func (ac *authMiddleware) authWithSession(ctx context.Context, md metadata.MD) (context.Context, error) {
	auth := md.Get(authHeader)
	if len(auth) == 0 {
		return ctx, rerrors.New("error getting auth header",
			codes.Unauthenticated,
			rerrors.WithHttpStatus(http.StatusUnauthorized))
	}

	user, err := ac.authService.GetUserByToken(ctx, auth[0])
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	if !user.Permissions.EarlyAccess {
		return nil, rerrors.New("Service in early access. Ask administrator to add you to white list",
			codes.Unavailable,
			rerrors.WithHttpStatus(http.StatusUnauthorized))
	}

	uc := user_context.UserContext{
		UserId:      user.Id,
		Permissions: user.Permissions,
	}

	ctx = user_context.WithUserContext(ctx, uc)
	log.AddField(ctx, func(e *zerolog.Event) *zerolog.Event {
		return e.Int64("user_id", uc.UserId)
	})
	return ctx, nil
}

func (ac *authMiddleware) authWithDebugHeaders(ctx context.Context, md metadata.MD) (*user_context.UserContext, error) {
	tgIdStr := md.Get(tgIdDebugHeader)
	if len(tgIdStr) != 0 {
		tgId, err := strconv.ParseInt(tgIdStr[0], 10, 64)
		if err != nil {
			return nil, rerrors.Wrap(err, "expected telegram id to be an integer", codes.FailedPrecondition)
		}

		internalUserId, err := ac.authService.ResolveTelegramId(ctx, tgId)
		if err != nil {
			return nil, rerrors.Wrap(err, "resolving telegram id in debug auth")
		}

		return &user_context.UserContext{
			UserId: internalUserId,
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
