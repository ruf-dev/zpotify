package home_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"
	"go.redsock.ru/toolbox"
	"google.golang.org/protobuf/types/known/timestamppb"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) GetFeed(ctx context.Context, request *zpotify_api.GetFeed_Request) (*zpotify_api.GetFeed_Response, error) {
	req := toDomainGetFeedRequest(request)

	result, err := impl.homeService.GetFeed(ctx, req)
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting feed")
	}

	resp := toPbGetFeedResponse(result)

	return resp, nil
}

func toDomainGetFeedRequest(request *zpotify_api.GetFeed_Request) domain.GetFeedRequest {
	req := domain.GetFeedRequest{
		Limit:  request.GetPaging().GetLimit(),
		Offset: request.GetPaging().GetOffset(),
	}

	return req
}

func toPbGetFeedResponse(result domain.GetFeedResult) *zpotify_api.GetFeed_Response {
	days := make([]*zpotify_api.FeedDay, 0, len(result.Days))
	for _, day := range result.Days {
		pbDay := toPbFeedDay(day)
		days = append(days, pbDay)
	}

	resp := &zpotify_api.GetFeed_Response{
		Days:      days,
		TotalDays: result.TotalDays,
	}

	return resp
}

func toPbFeedDay(day domain.FeedDay) *zpotify_api.FeedDay {
	playlists := make([]*zpotify_api.Playlist, 0, len(day.PlaylistsAdded))
	for _, pl := range day.PlaylistsAdded {
		pbPlaylist := toPbPlaylist(pl)
		playlists = append(playlists, pbPlaylist)
	}

	songs := make([]*zpotify_api.SongBase, 0, len(day.SongsAdded))
	for _, song := range day.SongsAdded {
		pbSong := toPbSongBase(song)
		songs = append(songs, pbSong)
	}

	artists := make([]*zpotify_api.ArtistBase, 0, len(day.ArtistsAdded))
	for _, artist := range day.ArtistsAdded {
		pbArtist := toPbArtistBase(artist)
		artists = append(artists, pbArtist)
	}

	date := timestamppb.New(day.Date)

	feedDay := &zpotify_api.FeedDay{
		Date:           date,
		PlaylistsAdded: playlists,
		SongsAdded:     songs,
		ArtistsAdded:   artists,
	}

	return feedDay
}

// toPbPlaylist mirrors playlist_api_impl.toPlaylist for the fields the feed
// query actually populates (Tags/CanEdit/IsSaved/OwnerUsername are always
// empty coming from HomeStorage.ListPlaylistsByDays, so they map to nil).
func toPbPlaylist(pl domain.Playlist) *zpotify_api.Playlist {
	artists := make([]*zpotify_api.ArtistBase, 0, len(pl.Artists))
	for _, a := range pl.Artists {
		pbArtist := toPbArtistBase(a)
		artists = append(artists, pbArtist)
	}

	var songCount *int32
	if pl.SongCount != nil {
		songCount = toolbox.ToPtr(*pl.SongCount)
	}

	var coverFilePath *string
	if pl.CoverFilePath != "" {
		coverFilePath = toolbox.ToPtr(pl.CoverFilePath)
	}

	pbPlaylist := &zpotify_api.Playlist{
		Uuid:          pl.Uuid,
		Name:          pl.Name,
		Description:   toolbox.ToPtr(pl.Description),
		IsPublic:      pl.IsPublic,
		Artists:       artists,
		SongCount:     songCount,
		CoverFilePath: coverFilePath,
		Year:          pl.Year,
	}

	return pbPlaylist
}

// toPbSongBase mirrors playlist_api_impl.toSong - domain.FeedSong has the same
// SongBase+Artists shape as domain.PlaylistSong.
func toPbSongBase(song domain.FeedSong) *zpotify_api.SongBase {
	artists := make([]*zpotify_api.ArtistBase, 0, len(song.Artists))
	for _, a := range song.Artists {
		pbArtist := toPbArtistBase(a)
		artists = append(artists, pbArtist)
	}

	pbSong := &zpotify_api.SongBase{
		Id:            song.Id,
		Title:         song.Title,
		Artists:       artists,
		DurationSec:   int32(song.Duration.Seconds()),
		FilePath:      song.FilePath,
		FileId:        song.FileId,
		CoverFilePath: song.CoverFilePath,
	}

	return pbSong
}

func toPbArtistBase(artist domain.ArtistsBase) *zpotify_api.ArtistBase {
	pbArtist := &zpotify_api.ArtistBase{
		Uuid:  artist.Uuid,
		Name:  artist.Name,
		Liked: artist.Liked,
	}

	return pbArtist
}
