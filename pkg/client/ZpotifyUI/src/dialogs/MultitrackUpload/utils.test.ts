import { describe, expect, it } from 'vitest';

import { canCleanTrackNumbers, cleanTrackNumber, isSingleFolderInput } from '@/dialogs/MultitrackUpload/utils';
import type { SongFile } from '@/app/api/zpotify';

describe('isSingleFolderInput', () => {
    it('is true when nested files share one top-level folder', () => {
        const files: SongFile[] = [
            { id: '1', path: 'tmp/u/The Wall/CD1/01.flac' },
            { id: '2', path: 'tmp/u/The Wall/CD2/01.flac' },
        ];

        expect(isSingleFolderInput([], files)).toBe(true);
    });

    it('is false when files span different top-level folders', () => {
        const files: SongFile[] = [
            { id: '1', path: 'tmp/u/A/01.flac' },
            { id: '2', path: 'tmp/u/B/01.flac' },
        ];

        expect(isSingleFolderInput([], files)).toBe(false);
    });

    it('is false when a file sits outside any folder', () => {
        const files: SongFile[] = [
            { id: '1', path: 'tmp/u/A/01.flac' },
            { id: '2', path: 'tmp/u/02.flac' },
        ];

        expect(isSingleFolderInput([], files)).toBe(false);
    });
});

describe('track number prefix', () => {
    it('cleans "number. title" prefixes', () => {
        expect(cleanTrackNumber('1. title')).toBe('title');
        expect(cleanTrackNumber('02. second title')).toBe('second title');
    });

    it('still cleans "number title" prefixes', () => {
        expect(cleanTrackNumber('01 title')).toBe('title');
    });

    it('allows cleaning when dotted numbers follow track order', () => {
        expect(canCleanTrackNumbers(['1. title', '2. second title'])).toBe(true);
    });

    it('forbids cleaning when dotted numbers break track order', () => {
        expect(canCleanTrackNumbers(['1. title', '3. second title'])).toBe(false);
    });
});
