package v1

import (
	"context"
	"time"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

const feedDayKeyLayout = "2006-01-02"

type HomeService struct {
	homeStorage storage.HomeStorage
}

func NewHomeService(data storage.Storage) *HomeService {
	return &HomeService{homeStorage: data.Home()}
}

func (s *HomeService) GetFeed(ctx context.Context, req domain.GetFeedRequest) (domain.GetFeedResult, error) {
	days, total, err := s.homeStorage.ListFeedDays(ctx, req.Limit, req.Offset)
	if err != nil {
		return domain.GetFeedResult{}, rerrors.Wrap(err, "error listing feed days")
	}

	result := domain.GetFeedResult{TotalDays: total}
	if len(days) == 0 {
		return result, nil
	}

	playlists, err := s.homeStorage.ListPlaylistsByDays(ctx, days)
	if err != nil {
		return domain.GetFeedResult{}, rerrors.Wrap(err, "error listing feed playlists")
	}

	songs, err := s.homeStorage.ListSongsByDays(ctx, days)
	if err != nil {
		return domain.GetFeedResult{}, rerrors.Wrap(err, "error listing feed songs")
	}

	artists, err := s.homeStorage.ListArtistsByDays(ctx, days)
	if err != nil {
		return domain.GetFeedResult{}, rerrors.Wrap(err, "error listing feed artists")
	}

	result.Days = bucketFeedDays(days, playlists, songs, artists)

	return result, nil
}

// bucketFeedDays groups the flat playlists/songs/artists slices by their
// CreatedAt day and assembles one domain.FeedDay per entry in days, preserving
// the order days was given in (already DESC-sorted by the query).
func bucketFeedDays(
	days []time.Time,
	playlists []domain.Playlist,
	songs []domain.FeedSong,
	artists []domain.ArtistsBase,
) []domain.FeedDay {
	playlistsByDay := make(map[string][]domain.Playlist)
	for _, pl := range playlists {
		key := pl.CreatedAt.UTC().Format(feedDayKeyLayout)
		playlistsByDay[key] = append(playlistsByDay[key], pl)
	}

	songsByDay := make(map[string][]domain.FeedSong)
	for _, song := range songs {
		key := song.CreatedAt.UTC().Format(feedDayKeyLayout)
		songsByDay[key] = append(songsByDay[key], song)
	}

	artistsByDay := make(map[string][]domain.ArtistsBase)
	for _, artist := range artists {
		key := artist.CreatedAt.UTC().Format(feedDayKeyLayout)
		artistsByDay[key] = append(artistsByDay[key], artist)
	}

	out := make([]domain.FeedDay, 0, len(days))
	for _, day := range days {
		key := day.UTC().Format(feedDayKeyLayout)

		feedDay := domain.FeedDay{
			Date:           day,
			PlaylistsAdded: playlistsByDay[key],
			SongsAdded:     songsByDay[key],
			ArtistsAdded:   artistsByDay[key],
		}

		out = append(out, feedDay)
	}

	return out
}
