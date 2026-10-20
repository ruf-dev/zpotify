import { describe, expect, it } from 'vitest';

import { buildTorrentFileTree, folderProgressPercent } from '@/dialogs/TorrentManage/processes/buildTorrentFileTree';
import type { TorrentFileRow } from '@/dialogs/TorrentManage/processes/mergeTorrentFiles';

function rows(...paths: string[]): TorrentFileRow[] {
    return paths.map((path) => ({ path }));
}

describe('buildTorrentFileTree', () => {
    it('keeps a torrent without folders as a flat list', () => {
        const tree = buildTorrentFileTree(rows('a.mp3', 'b.mp3'));

        expect(tree.children).toEqual([]);
        expect(tree.items.map((r) => r.path)).toEqual(['a.mp3', 'b.mp3']);
    });

    it('nests files under their folders', () => {
        const tree = buildTorrentFileTree(rows('cover.jpg', 'CD1/01.mp3', 'CD2/01.mp3', 'CD2/02.mp3'));

        expect(tree.items.map((r) => r.path)).toEqual(['cover.jpg']);
        expect(tree.children.map((c) => c.name)).toEqual(['CD1', 'CD2']);
        expect(tree.children[1].items.map((r) => r.path)).toEqual(['CD2/01.mp3', 'CD2/02.mp3']);
    });

    it('strips a single wrapper folder that holds no files itself', () => {
        const tree = buildTorrentFileTree(rows('Album/CD1/01.mp3', 'Album/CD2/01.mp3'));

        expect(tree.items).toEqual([]);
        expect(tree.children.map((c) => c.path)).toEqual(['Album/CD1', 'Album/CD2']);
    });

    it('strips nested wrapper folders down to the first level with content', () => {
        const tree = buildTorrentFileTree(rows('Pack/Album/01.mp3', 'Pack/Album/02.mp3'));

        expect(tree.children).toEqual([]);
        expect(tree.items.map((r) => r.path)).toEqual(['Pack/Album/01.mp3', 'Pack/Album/02.mp3']);
    });

    it('keeps two top-level folders', () => {
        const tree = buildTorrentFileTree(rows('A/01.mp3', 'B/01.mp3'));

        expect(tree.children.map((c) => c.name)).toEqual(['A', 'B']);
    });

    it('stops stripping at a folder that has files of its own', () => {
        const tree = buildTorrentFileTree(rows('Album/cover.jpg', 'Album/CD1/01.mp3'));

        expect(tree.children.map((c) => c.path)).toEqual(['Album/CD1']);
        expect(tree.items.map((r) => r.path)).toEqual(['Album/cover.jpg']);
    });
});

describe('folderProgressPercent', () => {
    it('returns zero when the total size is unknown', () => {
        expect(folderProgressPercent(rows('a.mp3'))).toBe(0);
    });

    it('aggregates downloaded and total bytes across rows', () => {
        const folderRows: TorrentFileRow[] = [
            { path: 'a.mp3', downloadedBytes: '100', totalBytes: '100' },
            { path: 'b.mp3', downloadedBytes: '0', totalBytes: '300' },
        ];

        expect(folderProgressPercent(folderRows)).toBe(25);
    });
});
