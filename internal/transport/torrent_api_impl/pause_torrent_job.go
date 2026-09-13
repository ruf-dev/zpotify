package torrent_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) PauseTorrentJob(ctx context.Context, req *zpotify_api.PauseTorrentJob_Request) (*zpotify_api.PauseTorrentJob_Response, error) {
	err := impl.torrentService.PauseJob(ctx, req.JobId)
	if err != nil {
		return nil, rerrors.Wrap(err, "error pausing torrent job")
	}

	resp := &zpotify_api.PauseTorrentJob_Response{}

	return resp, nil
}
