package domain

type PlaylistPermissions struct {
	CanDeleteSongs bool
	CanAddSongs    bool
}

type Playlist struct {
	Uuid          string
	Name          string
	Description   string
	IsPublic      bool
	Artists       []ArtistsBase
	CoverFileId   *int64
	CoverFilePath string
	SongCount     *int32
}

type CreatePlaylistParams struct {
	Name        string
	Description string
	IsPublic    bool
	ArtistUuids []string
	CoverFileId *int64
}

type UpdatePlaylistParams struct {
	Uuid        string
	Name        string
	Description string
	IsPublic    *bool
	ArtistUuids []string
	CoverFileId *int64
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

type ListPlaylists struct {
	Limit  uint64
	Offset uint64
}

type ListPlaylistsResult struct {
	Playlists []Playlist
	Total     uint32
}
