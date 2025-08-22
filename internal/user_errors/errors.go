package user_errors

import (
	"fmt"
	"net/http"

	"go.redsock.ru/rerrors"
	"google.golang.org/grpc/codes"
)

var (
	ErrUnexpected = rerrors.New("unexpected error")
	ErrNotFound   = rerrors.New("not found", codes.NotFound)
)

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
