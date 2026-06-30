package playlist_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"
	"go.redsock.ru/toolbox"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) ListPlaylists(ctx context.Context, req *zpotify_api.ListPlaylists_Request) (*zpotify_api.ListPlaylists_Response, error) {
	listReq := domain.ListPlaylists{
		Limit:        req.GetPaging().GetLimit(),
		Offset:       req.GetPaging().GetOffset(),
		ByAuthedUser: req.GetByAuthedUser(),
	}

	result, err := impl.playlistService.List(ctx, listReq)
	if err != nil {
		return nil, rerrors.Wrap(err, "error listing playlists")
	}

	protoPlaylists := make([]*zpotify_api.Playlist, 0, len(result.Playlists))
	for _, pl := range result.Playlists {
		protoPlaylist := toPlaylist(pl)
		protoPlaylists = append(protoPlaylists, protoPlaylist)
	}

	resp := &zpotify_api.ListPlaylists_Response{
		Playlists: protoPlaylists,
		Total:     result.Total,
	}

	return resp, nil
}

func toPlaylist(pl domain.Playlist) *zpotify_api.Playlist {
	protoArtists := make([]*zpotify_api.ArtistBase, 0, len(pl.Artists))
	for _, a := range pl.Artists {
		artist := toArtist(a)
		protoArtists = append(protoArtists, artist)
	}

	protoChips := make([]*zpotify_api.PlaylistChip, 0, len(pl.Chips))
	for _, c := range pl.Chips {
		chip := &zpotify_api.PlaylistChip{
			Kind:  c.Kind,
			Value: c.Value,
		}
		protoChips = append(protoChips, chip)
	}

	var songCount *int32
	if pl.SongCount != nil {
		songCount = toolbox.ToPtr(*pl.SongCount)
	}

	var coverFilePath *string
	if pl.CoverFilePath != "" {
		coverFilePath = toolbox.ToPtr(pl.CoverFilePath)
	}

	var canEdit *bool
	if pl.Permissions != nil && pl.Permissions.CanEdit {
		canEdit = toolbox.ToPtr(true)
	}

	return &zpotify_api.Playlist{
		Uuid:          pl.Uuid,
		Name:          pl.Name,
		Description:   toolbox.ToPtr(pl.Description),
		IsPublic:      pl.IsPublic,
		Artists:       protoArtists,
		SongCount:     songCount,
		CoverFilePath: coverFilePath,
		Year:          pl.Year,
		Chips:         protoChips,
		CanEdit:       canEdit,
	}
}

func protoChipsToDomain(chips []*zpotify_api.PlaylistChip) []domain.PlaylistChip {
	result := make([]domain.PlaylistChip, 0, len(chips))
	for _, c := range chips {
		chip := domain.PlaylistChip{
			Kind:  c.GetKind(),
			Value: c.GetValue(),
		}
		result = append(result, chip)
	}
	return result
}
