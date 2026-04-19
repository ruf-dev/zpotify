package storage

import (
	"net/http"

	"go.redsock.ru/rerrors"
	"google.golang.org/grpc/codes"
)

var (
	ErrAlreadyExists = rerrors.New("already exists")
	ErrNotFound      = rerrors.New("record not found", codes.NotFound, rerrors.WithHttpStatus(http.StatusNotFound))
)
