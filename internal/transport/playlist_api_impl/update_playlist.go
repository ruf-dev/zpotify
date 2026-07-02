package playlist_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) UpdatePlaylist(ctx context.Context, req *zpotify_api.UpdatePlaylist_Request) (*zpotify_api.UpdatePlaylist_Response, error) {
	updateReq := domain.UpdatePlaylistParams{
		Uuid:        req.GetUuid(),
		Name:        req.GetName(),
		Description: req.GetDescription(),
		ArtistUuids: req.GetArtistUuids(),
		Chips:       protoChipsToDomain(req.GetChips()),
	}

	if req.IsPublic != nil {
		isPublic := req.GetIsPublic()
		updateReq.IsPublic = &isPublic
	}

	if req.CoverFileId != nil {
		fileId := req.GetCoverFileId()
		updateReq.CoverFileId = &fileId
	}

	if req.Year != nil {
		year := req.GetYear()
		updateReq.Year = &year
	}

	result, err := impl.playlistService.Update(ctx, updateReq)
	if err != nil {
		return nil, rerrors.Wrap(err, "error updating playlist")
	}

	resp := &zpotify_api.UpdatePlaylist_Response{
		CoverFilePath: result.CoverFilePath,
	}

	return resp, nil
}
