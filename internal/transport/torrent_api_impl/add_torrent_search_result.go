package torrent_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) AddTorrentSearchResult(ctx context.Context, req *zpotify_api.AddTorrentSearchResult_Request) (*zpotify_api.AddTorrentSearchResult_Response, error) {
	result, err := impl.torrentSearchService.AddResult(ctx, req.Id)
	if err != nil {
		return nil, rerrors.Wrap(err, "error adding torrent search result")
	}

	resp := &zpotify_api.AddTorrentSearchResult_Response{}
	if result.ExistingJobId != 0 {
		existingJob := &zpotify_api.AddTorrentSearchResult_Response_ExistingJobId{
			ExistingJobId: result.ExistingJobId,
		}
		resp.Result = existingJob

		return resp, nil
	}

	upload := &zpotify_api.AddTorrentSearchResult_Response_UploadId{
		UploadId: result.UploadId,
	}
	resp.Result = upload

	return resp, nil
}
