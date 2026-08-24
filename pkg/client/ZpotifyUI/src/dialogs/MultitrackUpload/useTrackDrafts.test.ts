import { describe, it, expect } from 'vitest';

import { createTracksFromExistingFiles } from '@/dialogs/MultitrackUpload/useTrackDrafts';
import type { SongFile } from '@/app/api/zpotify';

describe('createTracksFromExistingFiles', () => {
    it('builds a TrackDraft from a foldered SongFile without touching upload/hash machinery', () => {
        const songFiles: SongFile[] = [{ id: 'f1', path: 'tmp/u1/MyAlbum/01 Song.mp3' }];

        const [track] = createTracksFromExistingFiles(songFiles);

        expect(track.fileId).toBe('f1');
        expect(track.folderName).toBe('MyAlbum');
        expect(track.title).toBe('01 Song');
        expect(track.uploadStatus).toBe('done');
        expect(track.uploadProgress).toBe(100);
        expect(track.isExisting).toBe(false);
        expect('file' in track).toBe(false);
    });

    it('handles a flat (non-foldered) SongFile path', () => {
        const songFiles: SongFile[] = [{ id: 'f2', path: 'tmp/u1/track-two.mp3' }];

        const [track] = createTracksFromExistingFiles(songFiles);

        expect(track.fileId).toBe('f2');
        expect(track.folderName).toBeUndefined();
        expect(track.title).toBe('track two');
    });

    it('returns an empty array for an empty input', () => {
        expect(createTracksFromExistingFiles([])).toEqual([]);
    });

    it('assigns a unique id per track', () => {
        const songFiles: SongFile[] = [
            { id: 'f1', path: 'tmp/u1/a.mp3' },
            { id: 'f2', path: 'tmp/u1/b.mp3' },
        ];

        const tracks = createTracksFromExistingFiles(songFiles);

        expect(tracks[0].id).not.toBe(tracks[1].id);
    });
});
