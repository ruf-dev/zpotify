export interface ParsedSongFilePath {
    folderName?: string;
    fileName: string;
}

export function parseSongFilePath(path?: string): ParsedSongFilePath {
    const segments = (path ?? '').split('/');
    const fileName = segments[segments.length - 1] || 'unknown file';
    // server stores files at tmp/{userId}/{file} (3 segments) and, when imported from a
    // folder or torrent, at tmp/{userId}/{dir}/{file} where {dir} can nest at any depth —
    // see internal/storage/file_storage_providers/storage.go
    const folderName = segments.length > 3 ? segments.slice(2, -1).join('/') : undefined;
    return { folderName, fileName };
}
