import type { TorrentFileRow } from '@/dialogs/TorrentManage/processes/mergeTorrentFiles';
import { buildFolderTree } from '@/shared/lib/folderTree.ts';
import type { FolderTree } from '@/shared/lib/folderTree.ts';

function folderOf(row: TorrentFileRow): string {
    const separatorIndex = row.path.lastIndexOf('/');
    return separatorIndex < 0 ? '' : row.path.slice(0, separatorIndex);
}

// The torrent's own top-level folder repeats the torrent name shown above the list,
// so single-child wrapper folders without files of their own are folded away.
export function buildTorrentFileTree(rows: TorrentFileRow[]): FolderTree<TorrentFileRow> {
    let tree = buildFolderTree(rows, folderOf);

    while (tree.items.length === 0 && tree.children.length === 1) {
        const [only] = tree.children;
        tree = { items: only.items, children: only.children };
    }

    return tree;
}

export function folderProgressPercent(rows: TorrentFileRow[]): number {
    const total = rows.reduce((sum, row) => sum + Number(row.totalBytes ?? 0), 0);
    if (total <= 0) return 0;

    const downloaded = rows.reduce((sum, row) => sum + Number(row.downloadedBytes ?? 0), 0);
    return Math.round((downloaded / total) * 100);
}
