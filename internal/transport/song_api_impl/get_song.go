package song_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) GetSong(ctx context.Context, req *zpotify_api.GetSong_Request) (*zpotify_api.GetSong_Response, error) {
	song, err := impl.audioService.GetSong(ctx, req.GetId())
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	resp := &zpotify_api.GetSong_Response{
		Song: domainSongToProto(song),
	}

	return resp, nil
}

func domainSongToProto(song domain.Song) *zpotify_api.SongBase {
	return &zpotify_api.SongBase{
		Id:          int64(song.SongBase.Id),
		Title:       song.Title,
		Artists:     domainArtistsToProto(song.Artists),
		DurationSec: int32(song.Duration.Seconds()),
		FilePath:    song.FilePath,
		FileId:      song.SongBase.FileId,
	}
}

func domainArtistsToProto(artists []domain.ArtistsBase) []*zpotify_api.ArtistBase {
	result := make([]*zpotify_api.ArtistBase, len(artists))
	for i, a := range artists {
		result[i] = &zpotify_api.ArtistBase{
			Uuid: a.Uuid,
			Name: a.Name,
		}
	}
	return result
}
