package user_errors

import (
	"google.golang.org/genproto/googleapis/rpc/errdetails"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

var (
	ErrRefreshTokenNotFound = errRefreshTokenNotFound()
	ErrAccessTokenNotFound  = errAccessTokenNotFound()
	ErrAccessTokenExpired   = errAccessTokenExpired()
)

func errRefreshTokenNotFound() error {
	st := status.New(codes.Unauthenticated, "refresh token doesn't exist")

	detail := &errdetails.ErrorInfo{
		Reason:   "REFRESH_TOKEN_NOT_FOUND",
		Domain:   "auth",
		Metadata: make(map[string]string),
	}

	detailedSt, _ := st.WithDetails(detail)

	return detailedSt.Err()
}

func errAccessTokenNotFound() error {
	st := status.New(codes.Unauthenticated, "access token doesn't exist")

	detail := &errdetails.ErrorInfo{
		Reason:   "ACCESS_TOKEN_NOT_FOUND",
		Domain:   "auth",
		Metadata: make(map[string]string),
	}

	detailedSt, _ := st.WithDetails(detail)

	return detailedSt.Err()
}

func errAccessTokenExpired() error {
	st := status.New(codes.Unauthenticated, "access token expired")

	detail := &errdetails.ErrorInfo{
		Reason:   "ACCESS_TOKEN_EXPIRED",
		Domain:   "auth",
		Metadata: make(map[string]string),
	}

	detailedSt, _ := st.WithDetails(detail)

	return detailedSt.Err()
}
