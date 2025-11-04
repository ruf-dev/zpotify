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

type CreatePlaylistReq struct {
	Name        string
	Description string
}
