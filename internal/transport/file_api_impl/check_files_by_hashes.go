package file_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) CheckFilesByHashes(ctx context.Context, req *zpotify_api.CheckFilesByHashes_Request) (*zpotify_api.CheckFilesByHashes_Response, error) {
	found, err := impl.fileService.CheckFilesByHashes(ctx, req.Hashes)
	if err != nil {
		return nil, rerrors.Wrap(err, "error checking files by hashes")
	}

	resp := &zpotify_api.CheckFilesByHashes_Response{
		Found: make([]*zpotify_api.CheckFilesByHashes_FoundFileByHash, 0, len(found)),
	}
	for _, f := range found {
		entry := &zpotify_api.CheckFilesByHashes_FoundFileByHash{
			Hash:   f.Hash,
			FileId: f.FileId,
			SongId: f.SongId,
		}
		resp.Found = append(resp.Found, entry)
	}

	return resp, nil
}
