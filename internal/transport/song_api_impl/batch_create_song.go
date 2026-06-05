package song_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/songs_q"
)

func (impl *Impl) BatchCreateSong(ctx context.Context, req *zpotify_api.BatchCreateSong_Request) (*zpotify_api.BatchCreateSong_Response, error) {
	songs := make([]domain.CreateSong, 0, len(req.GetSongs()))
	for _, s := range req.GetSongs() {
		createReq := domain.CreateSong{
			CreateSongParams: songs_q.CreateSongParams{
				Title:  s.GetTitle(),
				FileID: s.GetFileId(),
			},
			ArtistUuids: s.GetArtistUuids(),
		}
		songs = append(songs, createReq)
	}

	ids, err := impl.audioService.CreateBatch(ctx, songs)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return &zpotify_api.BatchCreateSong_Response{
		Ids: ids,
	}, nil
}
