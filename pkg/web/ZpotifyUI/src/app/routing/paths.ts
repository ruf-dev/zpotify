export enum Path {
    HomePage = '/',
    IntiPage = '/init',
    PlaylistPage = '/playlist/:id',
    AlbumPage = '/album/:id',
    EarlyAccessPage = '/early_access',
}

export function playlistPath(id: string): string {
    return `/playlist/${id}`;
}

export function albumPath(id: string): string {
    return `/album/${id}`;
}
