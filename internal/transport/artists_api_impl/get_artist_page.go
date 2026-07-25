package artists_api_impl

import (
	"context"

	"go.redsock.ru/rerrors"
	"go.redsock.ru/toolbox"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func (impl *Impl) GetArtistPage(ctx context.Context, request *zpotify_api.GetArtistPage_Request) (*zpotify_api.GetArtistPage_Response, error) {
	page, err := impl.artistsService.GetArtistPage(ctx, request.GetArtistUuid())
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting artist page")
	}

	resp := toPbArtistPage(page)

	return resp, nil
}

func toPbArtistPage(page domain.ArtistPage) *zpotify_api.GetArtistPage_Response {
	albums := make([]*zpotify_api.Playlist, 0, len(page.Albums))
	for _, pl := range page.Albums {
		albums = append(albums, toPbPlaylist(pl))
	}

	singles := make([]*zpotify_api.SongBase, 0, len(page.Singles))
	for _, song := range page.Singles {
		singles = append(singles, toPbSongBase(song))
	}

	features := make([]*zpotify_api.SongBase, 0, len(page.Features))
	for _, song := range page.Features {
		features = append(features, toPbSongBase(song))
	}

	resp := &zpotify_api.GetArtistPage_Response{
		Artist:   toPbArtist(page.Artist),
		Albums:   albums,
		Singles:  singles,
		Features: features,
	}

	return resp
}

func toPbArtist(artist domain.Artist) *zpotify_api.Artist {
	pbArtist := &zpotify_api.Artist{
		Uuid:    artist.Uuid,
		Name:    artist.Name,
		Liked:   artist.Liked,
		CanEdit: toolbox.ToPtr(artist.CanEdit),
	}

	if artist.AvatarFilePath != "" {
		pbArtist.AvatarFilePath = toolbox.ToPtr(artist.AvatarFilePath)
	}

	if artist.BackgroundCoverFilePath != "" {
		pbArtist.BackgroundCoverFilePath = toolbox.ToPtr(artist.BackgroundCoverFilePath)
	}

	return pbArtist
}

// toPbPlaylist mirrors playlist_api_impl.toPlaylist / home_api_impl.toPbPlaylist
// for the fields ArtistsService.GetArtistPage populates (Tags/Permissions/
// OwnerUsername are not needed on the artist page's album cards).
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

// toPbSongBase mirrors home_api_impl.toPbSongBase - domain.Song has the same
// SongBase+Artists shape as domain.FeedSong/domain.PlaylistSong.
func toPbSongBase(song domain.Song) *zpotify_api.SongBase {
	artists := make([]*zpotify_api.ArtistBase, 0, len(song.Artists))
	for _, a := range song.Artists {
		artists = append(artists, toPbArtistBase(a))
	}

	pbSong := &zpotify_api.SongBase{
		// song.Id is ambiguous (domain.Song embeds both SongBase and FileMeta,
		// which each declare Id), so it must be qualified explicitly; the other
		// fields below only exist on SongBase and resolve unambiguously.
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
