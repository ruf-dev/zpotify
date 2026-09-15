package file_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) CheckSongsByFileIds(ctx context.Context, req *zpotify_api.CheckSongsByFileIds_Request) (*zpotify_api.CheckSongsByFileIds_Response, error) {
	found, err := impl.fileService.CheckSongsByFileIds(ctx, req.FileIds)
	if err != nil {
		return nil, rerrors.Wrap(err, "error checking songs by file ids")
	}

	resp := &zpotify_api.CheckSongsByFileIds_Response{
		Found: make([]*zpotify_api.CheckSongsByFileIds_FoundSongByFileId, 0, len(found)),
	}
	for _, f := range found {
		entry := &zpotify_api.CheckSongsByFileIds_FoundSongByFileId{
			FileId: f.FileId,
			SongId: f.SongId,
		}
		resp.Found = append(resp.Found, entry)
	}

	return resp, nil
}
