package file_api_impl

import (
	"context"
	"fmt"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) UploadFile(ctx context.Context, req *zpotify_api.UploadFile_Request) (*zpotify_api.UploadFile_Response, error) {
	var id int64
	_, err := fmt.Sscanf(req.Id, "%d", &id)
	if err != nil {
		return nil, rerrors.Wrap(err, "error parsing file id")
	}

	path, err := impl.fileService.Upload(ctx, id, req.Content)
	if err != nil {
		return nil, rerrors.Wrap(err, "error in file service Upload")
	}

	return &zpotify_api.UploadFile_Response{
		Path: path,
	}, nil
}
