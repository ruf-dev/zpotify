package service_errors

import (
	"net/http"

	"go.redsock.ru/rerrors"
	"google.golang.org/grpc/codes"
)

var (
	ErrNotFound        = rerrors.New("not found", codes.NotFound, rerrors.WithHttpStatus(http.StatusNotFound))
	ErrUnauthenticated = rerrors.New("unauthenticated", codes.Unauthenticated)
	ErrUnauthorized    = rerrors.New("unauthorized", codes.PermissionDenied)

	ErrFileNotVerified = rerrors.New("file not verified", codes.FailedPrecondition, rerrors.WithHttpStatus(http.StatusBadRequest))

	ErrPendingTrackLimitReached = rerrors.New("pending track limit reached", codes.ResourceExhausted, rerrors.WithHttpStatus(http.StatusTooManyRequests))

	ErrTrackMustHaveOneArtist = rerrors.New("at least one artist is required", codes.InvalidArgument, rerrors.WithHttpStatus(http.StatusBadRequest))

	ErrUnsupportedUploadFormat = rerrors.New("unsupported file format", codes.InvalidArgument, rerrors.WithHttpStatus(http.StatusBadRequest))
)
