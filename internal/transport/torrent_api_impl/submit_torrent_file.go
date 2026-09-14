package torrent_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) SubmitTorrentFile(ctx context.Context, req *zpotify_api.SubmitTorrentFile_Request) (*zpotify_api.SubmitTorrentFile_Response, error) {
	jobId, err := impl.torrentService.SubmitTorrentFile(ctx, req.Id, req.FolderName, req.SelectedPaths)
	if err != nil {
		return nil, rerrors.Wrap(err, "error submitting torrent file")
	}

	resp := &zpotify_api.SubmitTorrentFile_Response{
		JobId: jobId,
	}

	return resp, nil
}
