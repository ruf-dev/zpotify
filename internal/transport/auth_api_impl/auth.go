package auth_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"
	"google.golang.org/protobuf/types/known/timestamppb"

	pb "go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) Auth(ctx context.Context, r *pb.Auth_Request) (*pb.Auth_Response, error) {
	var err error
	var session domain.UserSession

	switch payload := r.GetPayload().(type) {
	case *pb.Auth_Request_LogPass:
		session, err = impl.authService.AuthWithPassword(ctx, payload.LogPass.Login, payload.LogPass.Password)
	}

	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return &pb.Auth_Response{
		AuthData: toAuthData(session),
	}, nil
}

func toAuthData(session domain.UserSession) *pb.AuthData {
	return &pb.AuthData{
		AccessToken:      session.AccessToken,
		RefreshToken:     session.RefreshToken,
		AccessExpiresAt:  timestamppb.New(session.AccessExpiresAt),
		RefreshExpiresAt: timestamppb.New(session.RefreshExpiresAt),
	}
}
