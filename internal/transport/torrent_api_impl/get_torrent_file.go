package torrent_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) GetTorrentFile(ctx context.Context, req *zpotify_api.GetTorrentFile_Request) (*zpotify_api.GetTorrentFile_Response, error) {
	file, err := impl.torrentService.GetTorrentFile(ctx, req.Id)
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting torrent file")
	}

	resp := &zpotify_api.GetTorrentFile_Response{
		File: toTorrentFile(file),
	}

	return resp, nil
}
