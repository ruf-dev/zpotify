package torrent_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) ResumeTorrentJob(ctx context.Context, req *zpotify_api.ResumeTorrentJob_Request) (*zpotify_api.ResumeTorrentJob_Response, error) {
	err := impl.torrentService.ResumeJob(ctx, req.JobId)
	if err != nil {
		return nil, rerrors.Wrap(err, "error resuming torrent job")
	}

	resp := &zpotify_api.ResumeTorrentJob_Response{}

	return resp, nil
}
