import { describe, it, expect } from 'vitest';

import { parseSongFilePath } from '@/dialogs/AddTrack/screens/parseSongFilePath.ts';

describe('parseSongFilePath', () => {
    it('parses a flat file path (3 segments) with no folder', () => {
        const result = parseSongFilePath('tmp/user-1/abc123.mp3');

        expect(result).toEqual({ folderName: undefined, fileName: 'abc123.mp3' });
    });

    it('parses a foldered file path (4 segments) into folder + file name', () => {
        const result = parseSongFilePath('tmp/user-1/my-album/abc123.mp3');

        expect(result).toEqual({ folderName: 'my-album', fileName: 'abc123.mp3' });
    });

    it('falls back to "unknown file" for an empty or undefined path', () => {
        expect(parseSongFilePath(undefined)).toEqual({ folderName: undefined, fileName: 'unknown file' });
        expect(parseSongFilePath('')).toEqual({ folderName: undefined, fileName: 'unknown file' });
    });

    it('handles a path with only a filename (1 segment) defensively', () => {
        const result = parseSongFilePath('abc123.mp3');

        expect(result).toEqual({ folderName: undefined, fileName: 'abc123.mp3' });
    });
});
