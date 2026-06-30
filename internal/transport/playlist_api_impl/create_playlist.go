package playlist_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) CreatePlaylist(ctx context.Context, req *zpotify_api.CreatePlaylist_Request) (*zpotify_api.CreatePlaylist_Response, error) {
	createReq := domain.CreatePlaylistParams{
		Name:        req.GetName(),
		Description: req.GetDescription(),
		IsPublic:    req.GetIsPublic(),
		ArtistUuids: req.GetArtistUuids(),
	}

	if req.CoverFileId != nil {
		fileId := req.GetCoverFileId()
		createReq.CoverFileId = &fileId
	}

	if req.Year != nil {
		year := req.GetYear()
		createReq.Year = &year
	}

	playlistUuid, err := impl.playlistService.Create(ctx, createReq)
	if err != nil {
		return nil, rerrors.Wrap(err, "error creating playlist")
	}

	return &zpotify_api.CreatePlaylist_Response{Uuid: playlistUuid}, nil
}
