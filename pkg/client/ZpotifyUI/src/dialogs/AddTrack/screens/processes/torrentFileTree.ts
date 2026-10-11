import type { TorrentFileEntry } from '@/app/api/zpotify';
import { TORRENT_FILE_KINDS } from '@/shared/api/TorrentFileKinds.ts';
import { buildFolderTree, collectFolderItems } from '@/shared/lib/folderTree.ts';
import type { FolderNode, FolderTree } from '@/shared/lib/folderTree.ts';

function splitPath(entry: TorrentFileEntry): string[] {
    return (entry.path ?? '').split('/').filter((segment) => segment.length > 0);
}

function hasSingleSharedRoot(entries: TorrentFileEntry[]): boolean {
    if (entries.length === 0) {
        return false;
    }
    const firstSegments = entries.map((entry) => {
        const segments = splitPath(entry);
        return segments.length >= 2 ? segments[0] : undefined;
    });
    return firstSegments[0] !== undefined && firstSegments.every((segment) => segment === firstSegments[0]);
}

function supportedFirst(items: TorrentFileEntry[]): TorrentFileEntry[] {
    const supported = items.filter((item) => item.supported === true);
    const unsupported = items.filter((item) => item.supported !== true);
    return [...supported, ...unsupported];
}

function orderNode(node: FolderNode<TorrentFileEntry>): FolderNode<TorrentFileEntry> {
    return { ...node, items: supportedFirst(node.items), children: node.children.map(orderNode) };
}

export function buildTorrentFileTree(entries: TorrentFileEntry[]): FolderTree<TorrentFileEntry> {
    const skip = hasSingleSharedRoot(entries) ? 1 : 0;

    function folderOf(entry: TorrentFileEntry): string {
        return splitPath(entry).slice(skip, -1).join('/');
    }

    const tree = buildFolderTree(entries, folderOf);
    return { items: supportedFirst(tree.items), children: tree.children.map(orderNode) };
}

export interface FolderSelectionState {
    supportedPaths: string[];
    isChecked: boolean;
    isPartial: boolean;
}

export function folderSelectionState(
    node: FolderNode<TorrentFileEntry>,
    selectedPaths: Set<string>,
): FolderSelectionState {
    const supportedPaths = collectFolderItems(node)
        .filter((entry) => entry.supported === true)
        .map((entry) => entry.path ?? '');
    const selectedCount = supportedPaths.filter((path) => selectedPaths.has(path)).length;
    const isChecked = supportedPaths.length > 0 && selectedCount === supportedPaths.length;
    const isPartial = selectedCount > 0 && !isChecked;
    return { supportedPaths, isChecked, isPartial };
}

function pluralize(count: number, singular: string, plural: string): string {
    return `${count} ${count === 1 ? singular : plural}`;
}

export function folderContentsLabel(entries: TorrentFileEntry[]): string {
    const trackCount = entries.filter((entry) => entry.kind === TORRENT_FILE_KINDS.track).length;
    const coverCount = entries.filter((entry) => entry.kind === TORRENT_FILE_KINDS.cover).length;
    const otherCount = entries.length - trackCount - coverCount;

    const parts: string[] = [];
    if (trackCount > 0) {
        parts.push(pluralize(trackCount, 'track', 'tracks'));
    }
    if (coverCount > 0) {
        parts.push(pluralize(coverCount, 'photo', 'photos'));
    }
    if (otherCount > 0) {
        parts.push(`${otherCount} other`);
    }
    return parts.join(' · ');
}

function collectNodePaths(node: FolderNode<TorrentFileEntry>): string[] {
    return [node.path, ...node.children.flatMap(collectNodePaths)];
}

export function collectFolderPaths(tree: FolderTree<TorrentFileEntry>): string[] {
    return tree.children.flatMap(collectNodePaths);
}
