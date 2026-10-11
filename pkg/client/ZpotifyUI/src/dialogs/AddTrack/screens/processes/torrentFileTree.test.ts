import { describe, expect, it } from 'vitest';

import type { TorrentFileEntry } from '@/app/api/zpotify';
import { TORRENT_FILE_KINDS } from '@/shared/api/TorrentFileKinds.ts';
import {
    buildTorrentFileTree,
    collectFolderPaths,
    folderContentsLabel,
    folderSelectionState,
} from '@/dialogs/AddTrack/screens/processes/torrentFileTree.ts';

function file(path: string, supported = true): TorrentFileEntry {
    return { path, sizeBytes: '1', supported };
}

describe('buildTorrentFileTree', () => {
    it('strips the first segment when every path shares one root folder', () => {
        const tree = buildTorrentFileTree([file('Album/a.mp3'), file('Album/Disc 1/b.mp3')]);

        expect(tree.items.map((e) => e.path)).toEqual(['Album/a.mp3']);
        expect(tree.children.map((n) => n.name)).toEqual(['Disc 1']);
    });

    it('keeps the root folder when a file sits at the torrent root', () => {
        const tree = buildTorrentFileTree([file('Album/a.mp3'), file('readme.txt', false)]);

        expect(tree.children.map((n) => n.name)).toEqual(['Album']);
        expect(tree.items.map((e) => e.path)).toEqual(['readme.txt']);
    });

    it('keeps the root folders when first segments differ', () => {
        const tree = buildTorrentFileTree([file('A/a.mp3'), file('B/b.mp3')]);

        expect(tree.children.map((n) => n.name)).toEqual(['A', 'B']);
    });

    it('orders unsupported files last inside each folder', () => {
        const tree = buildTorrentFileTree([
            file('R/x/cover.jpg', false),
            file('R/x/one.mp3'),
            file('R/x/two.mp3'),
            file('R/notes.txt', false),
            file('R/top.mp3'),
        ]);

        expect(tree.items.map((e) => e.path)).toEqual(['R/top.mp3', 'R/notes.txt']);
        expect(tree.children[0].items.map((e) => e.path)).toEqual(['R/x/one.mp3', 'R/x/two.mp3', 'R/x/cover.jpg']);
    });

    it('builds nested folders with unique relative paths', () => {
        const tree = buildTorrentFileTree([file('R/a/b/c.mp3'), file('R/a/d.mp3')]);

        expect(tree.children[0].path).toBe('a');
        expect(tree.children[0].children[0].path).toBe('a/b');
    });
});

describe('folderSelectionState', () => {
    const tree = buildTorrentFileTree([
        file('F/a.mp3'),
        file('F/b.mp3'),
        file('F/c.jpg', false),
        file('G/d.jpg', false),
    ]);
    const folder = tree.children[0];
    const unsupportedFolder = tree.children[1];

    it('reports empty when nothing in the folder is selected', () => {
        const state = folderSelectionState(folder, new Set());

        expect(state).toEqual({ supportedPaths: ['F/a.mp3', 'F/b.mp3'], isChecked: false, isPartial: false });
    });

    it('reports partial when some supported descendants are selected', () => {
        const state = folderSelectionState(folder, new Set(['F/a.mp3']));

        expect(state.isPartial).toBe(true);
        expect(state.isChecked).toBe(false);
    });

    it('reports checked when all supported descendants are selected', () => {
        const state = folderSelectionState(folder, new Set(['F/a.mp3', 'F/b.mp3']));

        expect(state.isChecked).toBe(true);
        expect(state.isPartial).toBe(false);
    });

    it('reports no supported paths and never checked for a folder with only unsupported files', () => {
        const state = folderSelectionState(unsupportedFolder, new Set(['G/d.jpg']));

        expect(state).toEqual({ supportedPaths: [], isChecked: false, isPartial: false });
    });
});

function kindOf(kind: TorrentFileEntry['kind']): TorrentFileEntry {
    return { path: 'x', sizeBytes: '1', supported: true, kind };
}

function entriesOf(kind: TorrentFileEntry['kind'], count: number): TorrentFileEntry[] {
    return Array.from({ length: count }, () => kindOf(kind));
}

describe('folderContentsLabel', () => {
    it('returns every non-zero part when a folder mixes tracks, photos and other files', () => {
        const entries = [
            ...entriesOf(TORRENT_FILE_KINDS.track, 1),
            ...entriesOf(TORRENT_FILE_KINDS.cover, 4),
            ...entriesOf(TORRENT_FILE_KINDS.other, 2),
        ];

        expect(folderContentsLabel(entries)).toBe('1 track \u00b7 4 photos \u00b7 2 other');
    });

    it('returns only photos when a folder holds just covers', () => {
        expect(folderContentsLabel(entriesOf(TORRENT_FILE_KINDS.cover, 4))).toBe('4 photos');
    });

    it('uses singular forms for a single track or photo', () => {
        expect(folderContentsLabel(entriesOf(TORRENT_FILE_KINDS.track, 1))).toBe('1 track');
        expect(folderContentsLabel(entriesOf(TORRENT_FILE_KINDS.cover, 1))).toBe('1 photo');
    });

    it('counts unspecified and missing kinds as other', () => {
        const entries = [kindOf(TORRENT_FILE_KINDS.unspecified), { path: 'y', sizeBytes: '1', supported: false }];

        expect(folderContentsLabel(entries)).toBe('2 other');
    });
});

describe('collectFolderPaths', () => {
    it('returns every nested folder path', () => {
        const tree = buildTorrentFileTree([file('A/x/one.mp3'), file('A/x/y/two.mp3'), file('B/three.mp3')]);

        expect(collectFolderPaths(tree)).toEqual(['A', 'A/x', 'A/x/y', 'B']);
    });

    it('returns nothing when there are no folders', () => {
        expect(collectFolderPaths({ items: [], children: [] })).toEqual([]);
    });
});
