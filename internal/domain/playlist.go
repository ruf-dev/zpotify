package domain

type PlaylistPermissions struct {
	CanDeleteSongs bool
	CanAddSongs    bool
}

type Playlist struct {
	Uuid        string
	Name        string
	Description string
	IsPublic    bool
}

type CreatePlaylistParams struct {
	Name        string
	Description string
}

type SongsInPlaylist struct {
	Songs []PlaylistSong
	Total uint16
}

type PlaylistSong struct {
	SongBase
	Artists []ArtistsBase
}

type AddSongToPlaylist struct {
	PlaylistUuid string
	SongId       int32
}
