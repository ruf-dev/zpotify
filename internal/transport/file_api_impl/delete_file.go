package file_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) DeleteFile(ctx context.Context, req *zpotify_api.DeleteFile_Request) (*zpotify_api.DeleteFile_Response, error) {
	err := impl.fileService.DeleteUploadedFile(ctx, req.FileId)
	if err != nil {
		return nil, rerrors.Wrap(err, "error deleting file")
	}

	return &zpotify_api.DeleteFile_Response{}, nil
}
