package song_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

func (impl *Impl) SendSongToTelegram(ctx context.Context, req *zpotify_api.SendSongToTelegram_Request) (*zpotify_api.SendSongToTelegram_Response, error) {
	err := impl.audioService.SendToTelegram(ctx, req.GetId())
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return &zpotify_api.SendSongToTelegram_Response{}, nil
}
