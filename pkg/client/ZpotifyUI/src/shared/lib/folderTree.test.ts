import { describe, expect, it } from 'vitest';

import { buildFolderTree, collectFolderItems } from '@/shared/lib/folderTree.ts';

interface Entry {
    id: string;
    folder?: string;
}

function folderOf(entry: Entry): string | undefined {
    return entry.folder;
}

describe('buildFolderTree', () => {
    it('puts items without a folder into the root items', () => {
        const entries: Entry[] = [{ id: 'a' }, { id: 'b', folder: '' }];

        const tree = buildFolderTree(entries, folderOf);

        expect(tree.items).toEqual(entries);
        expect(tree.children).toEqual([]);
    });

    it('nests folders by path segment with full paths as keys', () => {
        const entry: Entry = { id: 'a', folder: 'The Wall/Root/CD1' };

        const tree = buildFolderTree([entry], folderOf);

        expect(tree.children).toHaveLength(1);
        const wall = tree.children[0];
        expect(wall.name).toBe('The Wall');
        expect(wall.path).toBe('The Wall');
        expect(wall.items).toEqual([]);
        const root = wall.children[0];
        expect(root.path).toBe('The Wall/Root');
        const cd1 = root.children[0];
        expect(cd1.name).toBe('CD1');
        expect(cd1.path).toBe('The Wall/Root/CD1');
        expect(cd1.items).toEqual([entry]);
    });

    it('merges non-adjacent items of the same folder and keeps first-seen order', () => {
        const entries: Entry[] = [
            { id: '1', folder: 'B' },
            { id: '2', folder: 'A/X' },
            { id: '3', folder: 'B' },
            { id: '4', folder: 'A' },
            { id: '5', folder: 'A/Y' },
            { id: '6' },
        ];

        const tree = buildFolderTree(entries, folderOf);

        expect(tree.children.map((c) => c.name)).toEqual(['B', 'A']);
        expect(tree.children[0].items.map((e) => e.id)).toEqual(['1', '3']);
        const a = tree.children[1];
        expect(a.items.map((e) => e.id)).toEqual(['4']);
        expect(a.children.map((c) => c.name)).toEqual(['X', 'Y']);
        expect(tree.items.map((e) => e.id)).toEqual(['6']);
    });
});

describe('collectFolderItems', () => {
    it('returns every descendant item, child folders before the node own items', () => {
        const entries: Entry[] = [
            { id: 'own', folder: 'A' },
            { id: 'x1', folder: 'A/X' },
            { id: 'deep', folder: 'A/X/Z' },
            { id: 'y1', folder: 'A/Y' },
        ];
        const tree = buildFolderTree(entries, folderOf);

        const ids = collectFolderItems(tree.children[0]).map((e) => e.id);

        expect(ids).toEqual(['deep', 'x1', 'y1', 'own']);
    });
});
