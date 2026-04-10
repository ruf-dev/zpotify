package file_api_impl

import (
	"context"
	"fmt"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) CreateFile(ctx context.Context, req *zpotify_api.CreateFile_Request) (*zpotify_api.CreateFile_Response, error) {
	id, err := impl.fileService.Create(ctx, req.Name)
	if err != nil {
		return nil, rerrors.Wrap(err, "error in file service Create")
	}

	return &zpotify_api.CreateFile_Response{
		Id: fmt.Sprintf("%d", id),
	}, nil
}
