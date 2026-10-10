import { describe, expect, it } from 'vitest';

import { folderProgress, groupTracksByFolder } from '@/dialogs/MultitrackUpload/groupTracksByFolder';
import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';

function makeTrack(id: string, folderName?: string, overrides: Partial<TrackDraft> = {}): TrackDraft {
    return {
        id,
        title: id,
        artists: [],
        duration: 0,
        uploadStatus: 'done',
        uploadProgress: 100,
        folderName,
        ...overrides,
    };
}

describe('groupTracksByFolder', () => {
    it('keeps tracks without a folder as bare entries with their global index', () => {
        const tracks = [makeTrack('a'), makeTrack('b')];

        const entries = groupTracksByFolder(tracks);

        expect(entries).toEqual([
            { kind: 'track', track: tracks[0], index: 0 },
            { kind: 'track', track: tracks[1], index: 1 },
        ]);
    });

    it('groups adjacent tracks with the same folder and splits non-adjacent ones', () => {
        const tracks = [makeTrack('a', 'X'), makeTrack('b', 'X'), makeTrack('c'), makeTrack('d', 'X')];

        const entries = groupTracksByFolder(tracks);

        expect(entries.map((e) => e.kind)).toEqual(['folder', 'track', 'folder']);
        const first = entries[0];
        expect(first.kind === 'folder' && first.folder.tracks.map((t) => t.id)).toEqual(['a', 'b']);
        const last = entries[2];
        expect(last.kind === 'folder' && last.folder.startIndex).toBe(3);
    });

    it('nests folders by path segment and preserves global indices of nested tracks', () => {
        const tracks = [
            makeTrack('t0', 'Wall/Root/CD1'),
            makeTrack('t1', 'Wall/Root/CD1'),
            makeTrack('t2', 'Wall/Root/CD2'),
            makeTrack('t3', 'Wall'),
            makeTrack('t4'),
        ];

        const entries = groupTracksByFolder(tracks);

        expect(entries).toHaveLength(2);
        const wall = entries[0];
        if (wall.kind !== 'folder') throw new Error('expected a folder');
        expect(wall.folder.name).toBe('Wall');
        expect(wall.folder.path).toBe('Wall');
        expect(wall.folder.tracks.map((t) => t.id)).toEqual(['t0', 't1', 't2', 't3']);
        expect(wall.folder.entries).toHaveLength(2);

        const root = wall.folder.entries[0];
        if (root.kind !== 'folder') throw new Error('expected a folder');
        expect(root.folder.path).toBe('Wall/Root');
        expect(root.folder.entries.map((e) => (e.kind === 'folder' ? e.folder.path : e.track.id))).toEqual([
            'Wall/Root/CD1',
            'Wall/Root/CD2',
        ]);
        const cd2 = root.folder.entries[1];
        if (cd2.kind !== 'folder') throw new Error('expected a folder');
        expect(cd2.folder.entries).toEqual([{ kind: 'track', track: tracks[2], index: 2 }]);

        expect(wall.folder.entries[1]).toEqual({ kind: 'track', track: tracks[3], index: 3 });
        expect(entries[1]).toEqual({ kind: 'track', track: tracks[4], index: 4 });
    });
});

describe('folderProgress', () => {
    it('weights upload progress by track size', () => {
        const tracks = [
            makeTrack('a', 'X', { size: 100, uploadProgress: 100 }),
            makeTrack('b', 'X', { size: 300, uploadProgress: 0 }),
        ];

        expect(folderProgress(tracks)).toBe(25);
    });
});
