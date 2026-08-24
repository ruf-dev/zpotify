export interface ParsedSongFilePath {
    folderName?: string;
    fileName: string;
}

export function parseSongFilePath(path?: string): ParsedSongFilePath {
    const segments = (path ?? '').split('/');
    const fileName = segments[segments.length - 1] || 'unknown file';
    // server stores flat files at tmp/{userId}/{file} (3 segments) and
    // foldered files at tmp/{userId}/{folder}/{file} (4 segments) — see
    // internal/storage/file_storage_providers/storage.go
    const folderName = segments.length > 3 ? segments[2] : undefined;
    return { folderName, fileName };
}
