package torrent_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) GetTorrentMagnet(ctx context.Context, req *zpotify_api.GetTorrentMagnet_Request) (*zpotify_api.GetTorrentMagnet_Response, error) {
	magnetUri, err := impl.torrentService.GetMagnet(ctx, req.JobId)
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting torrent magnet")
	}

	resp := &zpotify_api.GetTorrentMagnet_Response{
		MagnetUri: magnetUri,
	}

	return resp, nil
}
