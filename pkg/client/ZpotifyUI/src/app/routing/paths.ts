export enum Path {
    HomePage = '/',
    IntiPage = '/init',
    SearchPage = '/search',
    PlaylistPage = '/playlist/:id',
    AlbumPage = '/album/:id',
    ArtistPage = '/artist/:id',
    EarlyAccessPage = '/early_access',
}

export function playlistPath(id: string): string {
    return `/playlist/${id}`;
}

export function albumPath(id: string): string {
    return `/album/${id}`;
}

export function artistPath(id: string): string {
    return `/artist/${id}`;
}
