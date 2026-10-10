import { describe, expect, it } from 'vitest';

import { isSingleFolderInput } from '@/dialogs/MultitrackUpload/utils';
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
