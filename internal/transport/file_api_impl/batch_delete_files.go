package file_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) BatchDeleteFiles(ctx context.Context,
	req *zpotify_api.BatchDeleteFiles_Request) (
	*zpotify_api.BatchDeleteFiles_Response, error) {
	err := impl.fileService.DeleteUploadedFiles(ctx, req.FileIds)
	if err != nil {
		return nil, rerrors.Wrap(err, "error batch deleting files")
	}

	return &zpotify_api.BatchDeleteFiles_Response{}, nil
}
