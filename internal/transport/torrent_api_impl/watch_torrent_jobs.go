package torrent_api_impl

import (
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) WatchTorrentJobs(req *zpotify_api.WatchTorrentJobs_Request, stream zpotify_api.TorrentAPI_WatchTorrentJobsServer) error {
	ctx := stream.Context()

	folderName := req.GetFolderName()
	limit := req.GetLimit()

	jobCh, err := impl.torrentService.WatchJobs(ctx, folderName, limit)
	if err != nil {
		return rerrors.Wrap(err, "error watching torrent jobs")
	}

	for job := range jobCh {
		apiJob := toTorrentJob(job)
		resp := &zpotify_api.WatchTorrentJobs_Response{
			Job: apiJob,
		}

		sendErr := stream.Send(resp)
		if sendErr != nil {
			return nil
		}
	}

	return nil
}
