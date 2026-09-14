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

	ErrEmptySearchQuery = rerrors.New("search query must not be empty", codes.InvalidArgument, rerrors.WithHttpStatus(http.StatusBadRequest))

	// ErrTorrentClientUnavailable is returned when a torrent operation is
	// attempted while the bittorrent client failed to start or is not wired.
	ErrTorrentClientUnavailable = rerrors.New("torrent client is unavailable", codes.Unavailable, rerrors.WithHttpStatus(http.StatusServiceUnavailable))

	// ErrInvalidTorrentFile is returned for input that is not a parsable
	// .torrent file, including magnet links (which carry no info dict).
	ErrInvalidTorrentFile = rerrors.New("invalid torrent file", codes.InvalidArgument, rerrors.WithHttpStatus(http.StatusBadRequest))

	// ErrTorrentHasNoAudioFiles is returned when none of a torrent's files is
	// in a supported audio format, so there would be nothing to import.
	ErrTorrentHasNoAudioFiles = rerrors.New("torrent contains no supported audio files", codes.InvalidArgument, rerrors.WithHttpStatus(http.StatusBadRequest))

	// ErrTorrentConcurrencyLimitReached is returned when a user already has
	// the configured maximum of torrents downloading at once.
	ErrTorrentConcurrencyLimitReached = rerrors.New("too many torrents downloading at once", codes.ResourceExhausted, rerrors.WithHttpStatus(http.StatusTooManyRequests))

	// ErrTorrentNotRegistered is returned when a tracked torrent job has no
	// counterpart in the bittorrent client - e.g. after a process restart,
	// which does not re-register in-flight torrents.
	ErrTorrentNotRegistered = rerrors.New("torrent is not registered with the client", codes.FailedPrecondition, rerrors.WithHttpStatus(http.StatusConflict))

	// ErrTorrentAlreadyExists is returned when the caller already has a
	// torrent download registered for the same info hash. The existing job's
	// id is returned alongside this error so the caller can be redirected to
	// it instead of retrying the submit.
	ErrTorrentAlreadyExists = rerrors.New("torrent already submitted", codes.AlreadyExists, rerrors.WithHttpStatus(http.StatusConflict))

	// ErrFilePathCollisionUnresolved is returned when every content-hash-prefix
	// disambiguated path for an upload is already taken, up to the full hash
	// digest. This should never happen in practice - it would require another
	// file with a different content hash to occupy every disambiguated name.
	ErrFilePathCollisionUnresolved = rerrors.New("could not resolve a free file path", codes.Internal, rerrors.WithHttpStatus(http.StatusInternalServerError))

	// ErrNotImplemented is returned by a method whose contract has been
	// defined but whose business logic has not landed yet.
	ErrNotImplemented = rerrors.New("not implemented", codes.Unimplemented, rerrors.WithHttpStatus(http.StatusNotImplemented))

	// ErrTorrentUploadNotFound is returned when an upload handle from
	// UploadTorrentFile is unknown, expired, or not owned by the caller.
	ErrTorrentUploadNotFound = rerrors.New("torrent upload not found", codes.NotFound, rerrors.WithHttpStatus(http.StatusNotFound))

	// ErrTorrentInvalidSelection is returned when SubmitTorrentFile's selected
	// paths are empty, or do not each match a real, audio-supported file in
	// the torrent.
	ErrTorrentInvalidSelection = rerrors.New("invalid torrent file selection", codes.InvalidArgument, rerrors.WithHttpStatus(http.StatusBadRequest))
)
