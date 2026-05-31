package auth_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"
	"google.golang.org/grpc/metadata"

	pb "go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) Logout(ctx context.Context, _ *pb.Logout_Request) (*pb.Logout_Response, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, rerrors.New("no metadata in context")
	}

	auth := md.Get("authorization")
	if len(auth) == 0 {
		return nil, rerrors.New("no authorization header")
	}

	err := impl.authService.Logout(ctx, auth[0])
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return &pb.Logout_Response{}, nil
}
