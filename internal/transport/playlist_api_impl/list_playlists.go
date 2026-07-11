package playlist_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"
	"go.redsock.ru/toolbox"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
	generated "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

var albumTagKindProtoToDomain = map[zpotify_api.AlbumTagKind]generated.AlbumTagKind{
	zpotify_api.AlbumTagKind_ALBUM_TAG_KIND_GENRE:         generated.AlbumTagKindGenre,
	zpotify_api.AlbumTagKind_ALBUM_TAG_KIND_MOOD:          generated.AlbumTagKindMood,
	zpotify_api.AlbumTagKind_ALBUM_TAG_KIND_ERA:           generated.AlbumTagKindEra,
	zpotify_api.AlbumTagKind_ALBUM_TAG_KIND_VIBE:          generated.AlbumTagKindVibe,
	zpotify_api.AlbumTagKind_ALBUM_TAG_KIND_LANGUAGE:      generated.AlbumTagKindLanguage,
	zpotify_api.AlbumTagKind_ALBUM_TAG_KIND_THEME:         generated.AlbumTagKindTheme,
	zpotify_api.AlbumTagKind_ALBUM_TAG_KIND_HIT:           generated.AlbumTagKindHit,
	zpotify_api.AlbumTagKind_ALBUM_TAG_KIND_ALBUM_VERSION: generated.AlbumTagKindAlbumVersion,
}

var albumTagKindDomainToProto = map[generated.AlbumTagKind]zpotify_api.AlbumTagKind{
	generated.AlbumTagKindGenre:        zpotify_api.AlbumTagKind_ALBUM_TAG_KIND_GENRE,
	generated.AlbumTagKindMood:         zpotify_api.AlbumTagKind_ALBUM_TAG_KIND_MOOD,
	generated.AlbumTagKindEra:          zpotify_api.AlbumTagKind_ALBUM_TAG_KIND_ERA,
	generated.AlbumTagKindVibe:         zpotify_api.AlbumTagKind_ALBUM_TAG_KIND_VIBE,
	generated.AlbumTagKindLanguage:     zpotify_api.AlbumTagKind_ALBUM_TAG_KIND_LANGUAGE,
	generated.AlbumTagKindTheme:        zpotify_api.AlbumTagKind_ALBUM_TAG_KIND_THEME,
	generated.AlbumTagKindHit:          zpotify_api.AlbumTagKind_ALBUM_TAG_KIND_HIT,
	generated.AlbumTagKindAlbumVersion: zpotify_api.AlbumTagKind_ALBUM_TAG_KIND_ALBUM_VERSION,
}

var albumVersionKindProtoToDomain = map[zpotify_api.AlbumVersionMetadata_VersionKind]generated.AlbumVersionKind{
	zpotify_api.AlbumVersionMetadata_VERSION_KIND_DELUXE:      generated.AlbumVersionKindDeluxe,
	zpotify_api.AlbumVersionMetadata_VERSION_KIND_EXTENDED:    generated.AlbumVersionKindExtended,
	zpotify_api.AlbumVersionMetadata_VERSION_KIND_REMASTER:    generated.AlbumVersionKindRemaster,
	zpotify_api.AlbumVersionMetadata_VERSION_KIND_ANNIVERSARY: generated.AlbumVersionKindAnniversary,
	zpotify_api.AlbumVersionMetadata_VERSION_KIND_LIVE:        generated.AlbumVersionKindLive,
}

var albumVersionKindDomainToProto = map[generated.AlbumVersionKind]zpotify_api.AlbumVersionMetadata_VersionKind{
	generated.AlbumVersionKindDeluxe:      zpotify_api.AlbumVersionMetadata_VERSION_KIND_DELUXE,
	generated.AlbumVersionKindExtended:    zpotify_api.AlbumVersionMetadata_VERSION_KIND_EXTENDED,
	generated.AlbumVersionKindRemaster:    zpotify_api.AlbumVersionMetadata_VERSION_KIND_REMASTER,
	generated.AlbumVersionKindAnniversary: zpotify_api.AlbumVersionMetadata_VERSION_KIND_ANNIVERSARY,
	generated.AlbumVersionKindLive:        zpotify_api.AlbumVersionMetadata_VERSION_KIND_LIVE,
}

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

	protoTags := domainTagsToProto(pl.Tags)

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

	var isSaved *bool
	if pl.Permissions != nil && pl.Permissions.IsSaved {
		isSaved = toolbox.ToPtr(true)
	}

	var ownerUsername *string
	if pl.OwnerUsername != "" {
		ownerUsername = toolbox.ToPtr(pl.OwnerUsername)
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
		Tags:          protoTags,
		CanEdit:       canEdit,
		IsSaved:       isSaved,
		OwnerUsername: ownerUsername,
	}
}

func domainTagsToProto(tags []domain.AlbumTag) []*zpotify_api.AlbumTag {
	result := make([]*zpotify_api.AlbumTag, 0, len(tags))
	for _, t := range tags {
		protoTag := &zpotify_api.AlbumTag{
			Kind:  albumTagKindDomainToProto[t.Kind],
			Value: t.Value,
		}

		if t.VersionKind != nil {
			metadata := &zpotify_api.AlbumVersionMetadata{
				VersionKind: albumVersionKindDomainToProto[*t.VersionKind],
			}
			if t.ParentPlaylistUuid != nil {
				metadata.ParentPlaylistUuid = *t.ParentPlaylistUuid
			}
			protoTag.Metadata = &zpotify_api.AlbumTag_AlbumVersion{AlbumVersion: metadata}
		}

		result = append(result, protoTag)
	}
	return result
}

func protoTagsToDomain(tags []*zpotify_api.AlbumTag) []domain.AlbumTag {
	result := make([]domain.AlbumTag, 0, len(tags))
	for _, t := range tags {
		tag := domain.AlbumTag{
			Kind:  albumTagKindProtoToDomain[t.GetKind()],
			Value: t.GetValue(),
		}

		if albumVersion := t.GetAlbumVersion(); albumVersion != nil {
			versionKind := albumVersionKindProtoToDomain[albumVersion.GetVersionKind()]
			tag.VersionKind = &versionKind
			parentUuid := albumVersion.GetParentPlaylistUuid()
			tag.ParentPlaylistUuid = &parentUuid
		}

		result = append(result, tag)
	}
	return result
}
