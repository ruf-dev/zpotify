// .torrent detection, sibling to supportedAudio.ts.
export const TORRENT_EXTENSION = '.torrent';

export function isTorrentFileName(name: string): boolean {
    return name.toLowerCase().endsWith(TORRENT_EXTENSION);
}

export function isTorrentFile(file: File): boolean {
    return isTorrentFileName(file.name);
}
