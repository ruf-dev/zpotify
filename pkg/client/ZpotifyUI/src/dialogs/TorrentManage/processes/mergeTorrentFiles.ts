import type { ImportedFile, TorrentFileProgress } from '@/app/api/zpotify';

export interface TorrentFileRow {
    path: string;
    downloadedBytes?: string;
    totalBytes?: string;
    status?: string;
    error?: string;
    fileDeleted?: boolean;
}

// mergeTorrentFiles combines the live per-file download progress with the
// post-import outcome into one row per file, keyed by the torrent-relative
// path both lists share. A file present in only one of the two lists (still
// downloading, or imported without progress data) still gets a row.
export function mergeTorrentFiles(files: TorrentFileProgress[], importedFiles: ImportedFile[]): TorrentFileRow[] {
    const rows = new Map<string, TorrentFileRow>();

    for (const file of files) {
        if (!file.path) continue;
        rows.set(file.path, {
            path: file.path,
            downloadedBytes: file.downloadedBytes,
            totalBytes: file.totalBytes,
        });
    }

    for (const imported of importedFiles) {
        if (!imported.torrentPath) continue;
        const existing = rows.get(imported.torrentPath);
        rows.set(imported.torrentPath, {
            ...existing,
            path: imported.torrentPath,
            status: imported.status,
            error: imported.error,
            fileDeleted: imported.fileDeleted,
        });
    }

    return Array.from(rows.values());
}
