package user_errors

import (
	"go.redsock.ru/rerrors"
	"google.golang.org/grpc/codes"
)

var (
	ErrUnexpected       = rerrors.New("unexpected error")
	ErrNotFound         = rerrors.New("not found", codes.NotFound)
	ErrUnauthenticated  = rerrors.New("unauthenticated", codes.Unauthenticated)
	ErrPermissionDenied = rerrors.New("permission denied", codes.PermissionDenied)
)
