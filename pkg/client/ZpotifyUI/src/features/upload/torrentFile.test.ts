import { describe, expect, it } from 'vitest';

import { isTorrentFile, isTorrentFileName } from '@/features/upload/torrentFile.ts';

function makeFile(name: string): File {
    return new File(['content'], name);
}

describe('isTorrentFile', () => {
    it('returns true for a .torrent file', () => {
        expect(isTorrentFile(makeFile('ubuntu.torrent'))).toBe(true);
    });

    it('is case-insensitive', () => {
        expect(isTorrentFile(makeFile('Ubuntu.TORRENT'))).toBe(true);
    });

    it('returns false for a non-torrent file', () => {
        expect(isTorrentFile(makeFile('track.mp3'))).toBe(false);
    });

    it('returns false for a file with no extension', () => {
        expect(isTorrentFile(makeFile('torrent'))).toBe(false);
    });
});

describe('isTorrentFileName', () => {
    it('returns true for a .torrent name', () => {
        expect(isTorrentFileName('my-file.torrent')).toBe(true);
    });

    it('returns false for other names', () => {
        expect(isTorrentFileName('my-file.mp3')).toBe(false);
    });
});
