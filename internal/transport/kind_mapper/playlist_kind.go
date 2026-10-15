package kind_mapper

import (
	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	generated "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

// PlaylistKindFromProto treats UNSPECIFIED as PLAYLIST so clients that do not
// send a kind keep creating regular playlists.
func PlaylistKindFromProto(kind zpotify_api.PlaylistKind) generated.PlaylistKind {
	if kind == zpotify_api.PlaylistKind_PLAYLIST_KIND_SINGLE {
		return generated.PlaylistKindSINGLE
	}

	return generated.PlaylistKindPLAYLIST
}

func PlaylistKindToProto(kind generated.PlaylistKind) zpotify_api.PlaylistKind {
	switch kind {
	case generated.PlaylistKindPLAYLIST:
		return zpotify_api.PlaylistKind_PLAYLIST_KIND_PLAYLIST
	case generated.PlaylistKindSINGLE:
		return zpotify_api.PlaylistKind_PLAYLIST_KIND_SINGLE
	default:
		return zpotify_api.PlaylistKind_PLAYLIST_KIND_UNSPECIFIED
	}
}
