package secretbox

import (
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/service/service_errors"
)

func Encrypt(_ string, _ []byte) ([]byte, error) {
	return nil, rerrors.Wrap(service_errors.ErrNotImplemented)
}

func Decrypt(_ string, _ []byte) ([]byte, error) {
	return nil, rerrors.Wrap(service_errors.ErrNotImplemented)
}
