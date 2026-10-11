package torrent_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) DiscardTorrentFile(ctx context.Context, req *zpotify_api.DiscardTorrentFile_Request) (*zpotify_api.DiscardTorrentFile_Response, error) {
	err := impl.torrentService.DiscardTorrentFile(ctx, req.Id)
	if err != nil {
		return nil, rerrors.Wrap(err, "error discarding torrent file")
	}

	resp := &zpotify_api.DiscardTorrentFile_Response{}

	return resp, nil
}
