export enum Path {
    HomePage = '/',
    IntiPage = '/init',
    SearchPage = '/search',
    PlaylistPage = '/playlist/:id',
    AlbumPage = '/album/:id',
    ArtistPage = '/artist/:id',
    EarlyAccessPage = '/early_access',
}

export function playlistPath(id: string, focusTrackId?: string): string {
    return focusTrackId ? `/playlist/${id}?track=${encodeURIComponent(focusTrackId)}` : `/playlist/${id}`;
}

export function albumPath(id: string, focusTrackId?: string): string {
    return focusTrackId ? `/album/${id}?track=${encodeURIComponent(focusTrackId)}` : `/album/${id}`;
}

export function artistPath(id: string): string {
    return `/artist/${id}`;
}
