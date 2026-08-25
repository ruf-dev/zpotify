package torrent_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) GetTorrentJob(ctx context.Context, req *zpotify_api.GetTorrentJob_Request) (*zpotify_api.GetTorrentJob_Response, error) {
	row, err := impl.torrentService.GetJob(ctx, req.JobId)
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting torrent job")
	}

	resp := &zpotify_api.GetTorrentJob_Response{
		Job: toTorrentJob(row),
	}

	return resp, nil
}
