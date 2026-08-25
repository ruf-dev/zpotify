package torrent_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) CancelTorrentJob(ctx context.Context, req *zpotify_api.CancelTorrentJob_Request) (*zpotify_api.CancelTorrentJob_Response, error) {
	err := impl.torrentService.CancelJob(ctx, req.JobId)
	if err != nil {
		return nil, rerrors.Wrap(err, "error canceling torrent job")
	}

	resp := &zpotify_api.CancelTorrentJob_Response{}

	return resp, nil
}
