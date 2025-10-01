package zpotify_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/pkg/zpotify_api"
)

func (impl *Impl) DeleteSong(ctx context.Context, req *zpotify_api.DeleteSong_Request) (
	*zpotify_api.DeleteSong_Response, error) {

	err := impl.audioService.Delete(ctx, req.UniqueId)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return &zpotify_api.DeleteSong_Response{}, nil
}
