export enum Path {
    HomePage = '/',
    IntiPage = '/init',
    PlaylistPage = '/playlist/:id',
    EarlyAccessPage = '/early_access',
}

export function playlistPath(id: string): string {
    return `/playlist/${id}`;
}
