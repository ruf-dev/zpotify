package prowlarr

import "go.redsock.ru/rerrors"

var (
	errUnexpectedStatus   = rerrors.New("unexpected prowlarr response status")
	errUnexpectedRedirect = rerrors.New("unexpected prowlarr redirect target")
	errTorrentTooLarge    = rerrors.New("torrent file is too large")
)
