package user_errors

import (
	"fmt"
	"net/http"

	"go.redsock.ru/rerrors"
)

var ErrUnexpected = rerrors.New("unexpected error")

func NotFound(resName string) UserError {
	return notFound{ResourceName: resName}
}

type notFound struct {
	ResourceName string
}

type UserError interface {
	Error() string
	ApiUnwrap(w http.ResponseWriter)
}

func (e notFound) Error() string {
	return fmt.Sprintf("%s not found", e.ResourceName)
}

func (e notFound) ApiUnwrap(w http.ResponseWriter) {

}
