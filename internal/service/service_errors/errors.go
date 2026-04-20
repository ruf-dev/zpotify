package service_errors

import (
	"net/http"

	"go.redsock.ru/rerrors"
	"google.golang.org/grpc/codes"
)

var (
	ErrNotFound        = rerrors.New("not found", codes.NotFound, rerrors.WithHttpStatus(http.StatusNotFound))
	ErrUnauthenticated = rerrors.New("unauthenticated", codes.Unauthenticated)
	ErrUnauthorized    = rerrors.New("unauthorized", codes.PermissionDenied)

	ErrFileNotVerified = rerrors.New("file not verified", codes.FailedPrecondition, rerrors.WithHttpStatus(http.StatusBadRequest))
)
