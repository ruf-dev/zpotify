package search_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"
	"go.redsock.ru/toolbox"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
)

func (impl *Impl) Search(ctx context.Context, req *zpotify_api.Search_Request) (*zpotify_api.Search_Response, error) {
	params := domain.SearchParams{
		Query: req.GetQuery(),
	}

	userCtx, ok := user_context.GetUserContext(ctx)
	if ok {
		params.UserId = userCtx.UserId
	}

	paging := req.GetPaging()
	if paging != nil {
		params.Limit = paging.GetLimit()
		params.Offset = paging.GetOffset()
	}

	filters := req.GetFilters()
	if filters != nil {
		// Tags is reserved for future genre/mood facet filtering - accepted
		// here and threaded down to domain.SearchParams, but intentionally
		// not applied by any service/storage layer in this pass.
		params.Filters.Tags = filters.GetTags()
	}

	result, err := impl.searchService.Search(ctx, params)
	if err != nil {
		return nil, rerrors.Wrap(err, "error searching")
	}

	resp := &zpotify_api.Search_Response{
		Tracks:    toPbTrackResults(result.Tracks),
		Artists:   toPbArtistResults(result.Artists),
		Albums:    toPbAlbumResults(result.Albums),
		Playlists: toPbPlaylistResults(result.Playlists),
	}

	return resp, nil
}

func toPbTrackResults(tracks []domain.Song) []*zpotify_api.Search_TrackResult {
	results := make([]*zpotify_api.Search_TrackResult, len(tracks))
	for i, track := range tracks {
		results[i] = &zpotify_api.Search_TrackResult{
			Song:              toPbSongBase(track),
			Score:             track.Score,
			ContainerPlaylist: toPbContainerPlaylist(track.ContainerPlaylist),
		}
	}

	return results
}

func toPbContainerPlaylist(container *domain.ContainerPlaylist) *zpotify_api.Search_ContainerPlaylist {
	if container == nil {
		return nil
	}

	pbContainer := &zpotify_api.Search_ContainerPlaylist{
		Uuid:    container.Uuid,
		Name:    container.Name,
		IsAlbum: container.IsAlbum,
	}

	return pbContainer
}

func toPbArtistResults(artists []domain.ArtistSearchResult) []*zpotify_api.Search_ArtistResult {
	results := make([]*zpotify_api.Search_ArtistResult, len(artists))
	for i, artist := range artists {
		var avatarFilePath *string
		if artist.AvatarFilePath != "" {
			avatarFilePath = toolbox.ToPtr(artist.AvatarFilePath)
		}

		pbArtist := &zpotify_api.ArtistBase{
			Uuid:           artist.Uuid,
			Name:           artist.Name,
			Liked:          artist.Liked,
			AvatarFilePath: avatarFilePath,
		}

		results[i] = &zpotify_api.Search_ArtistResult{
			Artist: pbArtist,
			Score:  artist.Score,
		}
	}

	return results
}

func toPbAlbumResults(albums []domain.PlaylistSearchResult) []*zpotify_api.Search_AlbumResult {
	results := make([]*zpotify_api.Search_AlbumResult, len(albums))
	for i, album := range albums {
		results[i] = &zpotify_api.Search_AlbumResult{
			Playlist: toPbPlaylist(album.Playlist),
			Score:    album.Score,
		}
	}

	return results
}

func toPbPlaylistResults(playlists []domain.PlaylistSearchResult) []*zpotify_api.Search_PlaylistResult {
	results := make([]*zpotify_api.Search_PlaylistResult, len(playlists))
	for i, playlist := range playlists {
		results[i] = &zpotify_api.Search_PlaylistResult{
			Playlist: toPbPlaylist(playlist.Playlist),
			Score:    playlist.Score,
		}
	}

	return results
}

// toPbPlaylist mirrors artists_api_impl.toPbPlaylist / home_api_impl.toPbPlaylist
// for the fields PlaylistService.Search populates.
func toPbPlaylist(pl domain.Playlist) *zpotify_api.Playlist {
	artists := make([]*zpotify_api.ArtistBase, 0, len(pl.Artists))
	for _, a := range pl.Artists {
		artists = append(artists, toPbArtistBase(a))
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

// toPbSongBase mirrors artists_api_impl.toPbSongBase - domain.Song has the
// same SongBase+Artists shape as domain.PlaylistSong/domain.FeedSong.
func toPbSongBase(song domain.Song) *zpotify_api.SongBase {
	artists := make([]*zpotify_api.ArtistBase, 0, len(song.Artists))
	for _, a := range song.Artists {
		artists = append(artists, toPbArtistBase(a))
	}

	pbSong := &zpotify_api.SongBase{
		// song.Id is ambiguous (domain.Song embeds both SongBase and FileMeta,
		// which each declare Id), so it must be qualified explicitly.
		Id:            song.SongBase.Id,
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
