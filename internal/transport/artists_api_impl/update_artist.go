package artists_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) UpdateArtist(ctx context.Context, request *zpotify_api.UpdateArtist_Request) (*zpotify_api.UpdateArtist_Response, error) {
	updateReq := domain.UpdateArtistParams{
		Uuid: request.GetUuid(),
	}

	if request.Name != nil {
		updateReq.Name = request.GetName()
	}

	if request.AvatarFileId != nil {
		avatarFileId := request.GetAvatarFileId()
		updateReq.AvatarFileId = &avatarFileId
	}

	if request.BackgroundCoverFileId != nil {
		backgroundCoverFileId := request.GetBackgroundCoverFileId()
		updateReq.BackgroundCoverFileId = &backgroundCoverFileId
	}

	result, err := impl.artistsService.Update(ctx, updateReq)
	if err != nil {
		return nil, rerrors.Wrap(err, "error updating artist")
	}

	resp := &zpotify_api.UpdateArtist_Response{
		AvatarFilePath:          result.AvatarFilePath,
		BackgroundCoverFilePath: result.BackgroundCoverFilePath,
	}

	return resp, nil
}
