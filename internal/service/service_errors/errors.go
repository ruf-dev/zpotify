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

	ErrSongSizeLimitExceeded = rerrors.New("song size limit exceeded", codes.ResourceExhausted, rerrors.WithHttpStatus(http.StatusTooManyRequests))

	ErrTotalUploadSizeLimitExceeded = rerrors.New("total upload size limit exceeded", codes.ResourceExhausted, rerrors.WithHttpStatus(http.StatusTooManyRequests))

	ErrTrackMustHaveOneArtist = rerrors.New("at least one artist is required", codes.InvalidArgument, rerrors.WithHttpStatus(http.StatusBadRequest))

	ErrUnsupportedUploadFormat = rerrors.New("unsupported file format", codes.InvalidArgument, rerrors.WithHttpStatus(http.StatusBadRequest))

	ErrInvalidImageFile = rerrors.New("uploaded file is not a valid image", codes.InvalidArgument, rerrors.WithHttpStatus(http.StatusBadRequest))

	ErrInvalidAlbumVersion = rerrors.New("invalid album version tag", codes.InvalidArgument, rerrors.WithHttpStatus(http.StatusBadRequest))

	ErrSongAlreadyInPlaylist = rerrors.New("song is already in playlist", codes.AlreadyExists, rerrors.WithHttpStatus(http.StatusConflict))

	ErrFileAlreadyUsed = rerrors.New("file is already attached to a song", codes.FailedPrecondition, rerrors.WithHttpStatus(http.StatusConflict))

	ErrTelegramNotLinked = rerrors.New("telegram account is not linked", codes.FailedPrecondition, rerrors.WithHttpStatus(http.StatusBadRequest))
)
