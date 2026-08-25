package torrent_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) ListTorrentJobs(ctx context.Context, req *zpotify_api.ListTorrentJobs_Request) (*zpotify_api.ListTorrentJobs_Response, error) {
	rows, err := impl.torrentService.ListJobs(ctx, req.FolderName)
	if err != nil {
		return nil, rerrors.Wrap(err, "error listing torrent jobs")
	}

	jobs := make([]*zpotify_api.TorrentJob, 0, len(rows))
	for _, row := range rows {
		jobs = append(jobs, toTorrentJob(row))
	}

	resp := &zpotify_api.ListTorrentJobs_Response{
		Jobs: jobs,
	}

	return resp, nil
}
