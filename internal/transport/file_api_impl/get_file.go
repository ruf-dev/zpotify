package file_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) GetFile(ctx context.Context, req *zpotify_api.GetFile_Request) (*zpotify_api.GetFile_Response, error) {
	file, err := impl.fileService.GetFile(ctx, req.FileId)
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting file from service")
	}

	res := &zpotify_api.GetFile_Response{
		File: &zpotify_api.FileInfo{
			Id:          file.Id,
			Path:        file.FilePath,
			SizeBytes:   file.SizeBytes,
			DurationSec: int64(file.Duration.Seconds()),
		},
	}

	return res, nil
}
