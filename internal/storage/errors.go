package storage

import (
	"net/http"

	"go.redsock.ru/rerrors"
	"google.golang.org/grpc/codes"
)

var (
	ErrAlreadyExists = rerrors.New("already exists", codes.AlreadyExists, rerrors.WithHttpStatus(http.StatusConflict))
	ErrNotFound      = rerrors.New("record not found", codes.NotFound, rerrors.WithHttpStatus(http.StatusNotFound))
)
