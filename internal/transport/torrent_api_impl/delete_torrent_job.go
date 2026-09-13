package torrent_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) DeleteTorrentJob(ctx context.Context, req *zpotify_api.DeleteTorrentJob_Request) (*zpotify_api.DeleteTorrentJob_Response, error) {
	err := impl.torrentService.DeleteJob(ctx, req.JobId)
	if err != nil {
		return nil, rerrors.Wrap(err, "error deleting torrent job")
	}

	resp := &zpotify_api.DeleteTorrentJob_Response{}

	return resp, nil
}
