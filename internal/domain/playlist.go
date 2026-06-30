package domain

import "database/sql"

type PlaylistPermissions struct {
	CanDeleteSongs bool
	CanAddSongs    bool
	CanEdit        bool
}

type PlaylistChip struct {
	Kind  string
	Value string
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
	Year          *int32
	Chips         []PlaylistChip
	Permissions   *PlaylistPermissions
}

type ChangeSongsOrderParams struct {
	PlaylistUuid string
	SongIds      []int64
}

type CreatePlaylistParams struct {
	Name        string
	Description string
	IsPublic    bool
	ArtistUuids []string
	CoverFileId *int64
	Year        *int32
	Chips       []PlaylistChip
}

type UpdatePlaylistParams struct {
	Uuid        string
	Name        string
	Description string
	IsPublic    *bool
	ArtistUuids []string
	CoverFileId *int64
	Year        *int32
	Chips       []PlaylistChip
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

type PlaylistFilter struct {
	UserId sql.Null[int64]
}

type ListPlaylists struct {
	Limit        uint64
	Offset       uint64
	ByAuthedUser bool
	Filter       PlaylistFilter
}

type ListPlaylistsResult struct {
	Playlists []Playlist
	Total     uint32
}
