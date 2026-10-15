package gdrive

import "go.redsock.ru/rerrors"

var (
	ErrNotConnected      = rerrors.New("google drive is not connected")
	ErrNotFound          = rerrors.New("google drive file not found")
	ErrUnexpectedStatus  = rerrors.New("google drive unexpected response status")
	ErrEmptyRefreshToken = rerrors.New("google did not return a refresh token")
	ErrProbeMismatch     = rerrors.New("google drive probe content mismatch")
)
