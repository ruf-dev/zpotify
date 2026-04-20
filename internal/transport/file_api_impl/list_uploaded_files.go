package file_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) ListUploadedFiles(ctx context.Context, req *zpotify_api.ListUploadedFiles_Request) (
	*zpotify_api.ListUploadedFiles_Response, error) {

	listReq := domain.ListUploadedFiles{
		TemporaryOnly: req.TemporaryOnly,
	}

	files, err := impl.fileService.ListUploadedFiles(ctx, listReq)
	if err != nil {
		return nil, rerrors.Wrap(err, "Unable to list uploaded files")
	}

	return &zpotify_api.ListUploadedFiles_Response{
		Files: toProtoSongFiles(files),
	}, nil
}

func toProtoSongFiles(files []domain.SongFile) []*zpotify_api.SongFile {
	res := make([]*zpotify_api.SongFile, 0, len(files))
	for _, f := range files {
		res = append(res, &zpotify_api.SongFile{
			Id:   f.Id,
			Path: f.Path,
		})
	}
	return res
}
