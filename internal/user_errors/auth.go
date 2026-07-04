package user_errors

import (
	"go.redsock.ru/rerrors"
	"google.golang.org/genproto/googleapis/rpc/errdetails"
	"google.golang.org/grpc/codes"
)

const authErrorDomain = "auth"

var (
	ErrRefreshTokenNotFound = rerrors.New("refresh token doesn't exist", codes.Unauthenticated,
		&errdetails.ErrorInfo{
			Reason:   "REFRESH_TOKEN_NOT_FOUND",
			Domain:   authErrorDomain,
			Metadata: make(map[string]string),
		},
	)
	ErrAccessTokenNotFound = rerrors.New("access token doesn't exist",
		codes.Unauthenticated,
		&errdetails.ErrorInfo{
			Reason:   "ACCESS_TOKEN_NOT_FOUND",
			Domain:   authErrorDomain,
			Metadata: make(map[string]string),
		})
	ErrAccessTokenExpired = rerrors.New(
		"token expired",
		codes.Unauthenticated,
		&errdetails.ErrorInfo{
			Reason:   "ACCESS_TOKEN_EXPIRED",
			Domain:   authErrorDomain,
			Metadata: make(map[string]string),
		},
	)
)
