package song_api_impl

import (
	"context"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/songs_q"
)

func (impl *Impl) CreateSong(ctx context.Context, req *zpotify_api.CreateSong_Request) (*zpotify_api.CreateSong_Response, error) {
	createReq := domain.CreateSong{
		CreateSongParams: songs_q.CreateSongParams{
			Title:  req.GetTitle(),
			FileID: req.GetFileId(),
		},
		ArtistUuids: req.GetArtistUuids(),
	}

	id, err := impl.audioService.Create(ctx, createReq)
	if err != nil {
		return nil, err
	}

	return &zpotify_api.CreateSong_Response{
		Id: id,
	}, nil
}
