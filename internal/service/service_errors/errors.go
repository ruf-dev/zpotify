package service_errors

import (
	"go.redsock.ru/rerrors"
	"google.golang.org/grpc/codes"
)

var (
	ErrNotFound        = rerrors.New("not found")
	ErrUnauthenticated = rerrors.New("unauthenticated", codes.Unauthenticated)
)
