package webdav

import "go.redsock.ru/rerrors"

var (
	ErrNotFound         = rerrors.New("webdav resource not found")
	ErrUnexpectedStatus = rerrors.New("webdav unexpected response status")
	ErrUrlRequired      = rerrors.New("webdav url is required")
	ErrProbeMismatch    = rerrors.New("webdav probe content mismatch")
)
