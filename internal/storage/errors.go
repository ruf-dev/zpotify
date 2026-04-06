package storage

import (
	"go.redsock.ru/rerrors"
	"google.golang.org/grpc/codes"
)

var (
	ErrAlreadyExists = rerrors.New("already exists")
	ErrNotFound      = rerrors.New("not found", codes.NotFound)
)
