package zpotify_api_impl

import (
	"time"

	"go.redsock.ru/rerrors"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/types/known/timestamppb"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/pkg/zpotify_api"
)

func (impl *Impl) Auth(_ *zpotify_api.Auth_Request,
	respC grpc.ServerStreamingServer[zpotify_api.Auth_Response]) error {

	authUuid, doneC := impl.authService.InitAuth()

	initResp := &zpotify_api.Auth_Response{
		Payload: &zpotify_api.Auth_Response_AuthUuid{
			AuthUuid: authUuid,
		},
	}
	err := respC.Send(initResp)
	if err != nil {
		return rerrors.Wrap(err, "send auth response")
	}

	var session domain.UserSession

	select {
	case <-time.NewTimer(time.Second * 15).C:
		return rerrors.New("auth timeout")
	case session = <-doneC:
	}

	userDataResp := &zpotify_api.Auth_Response{
		Payload: &zpotify_api.Auth_Response_AuthData{
			AuthData: &zpotify_api.Auth_AuthData{
				AccessToken:      session.AccessToken,
				RefreshToken:     session.RefreshToken,
				AccessExpiresAt:  timestamppb.New(session.AccessExpiresAt),
				RefreshExpiresAt: timestamppb.New(session.RefreshExpiresAt),
			},
		},
	}

	err = respC.Send(userDataResp)
	if err != nil {
		return rerrors.Wrap(err, "send auth response")
	}

	return nil
}
