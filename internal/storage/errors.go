package storage

import (
	"go.redsock.ru/rerrors"
)

var (
	ErrAlreadyExists = rerrors.New("already exists")
	ErrNotFound      = rerrors.New("not found")
)
