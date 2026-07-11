package song_api_impl

import (
	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/songs_q"
)

var songTagKindProtoToDomain = map[zpotify_api.SongTagKind]songs_q.SongTagKind{
	zpotify_api.SongTagKind_SONG_TAG_KIND_SINGLE: songs_q.SongTagKindSingle,
}

var songTagKindDomainToProto = map[songs_q.SongTagKind]zpotify_api.SongTagKind{
	songs_q.SongTagKindSingle: zpotify_api.SongTagKind_SONG_TAG_KIND_SINGLE,
}

func protoSongTagsToDomain(tags []*zpotify_api.SongTag) []domain.SongTag {
	result := make([]domain.SongTag, 0, len(tags))
	for _, t := range tags {
		tag := domain.SongTag{
			Kind:  songTagKindProtoToDomain[t.GetKind()],
			Value: t.GetValue(),
		}
		result = append(result, tag)
	}
	return result
}

func domainSongTagsToProto(tags []domain.SongTag) []*zpotify_api.SongTag {
	result := make([]*zpotify_api.SongTag, 0, len(tags))
	for _, t := range tags {
		tag := &zpotify_api.SongTag{
			Kind:  songTagKindDomainToProto[t.Kind],
			Value: t.Value,
		}
		result = append(result, tag)
	}
	return result
}
