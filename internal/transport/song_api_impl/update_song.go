package song_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) UpdateSong(ctx context.Context, req *zpotify_api.UpdateSong_Request) (*zpotify_api.UpdateSong_Response, error) {
	updateReq := domain.UpdateSong{
		Id:          req.GetId(),
		Title:       req.GetTitle(),
		ArtistUuids: req.GetArtistUuids(),
	}

	err := impl.audioService.Update(ctx, updateReq)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return &zpotify_api.UpdateSong_Response{}, nil
}
