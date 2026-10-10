export interface FolderNode<T> {
    name: string;
    path: string;
    items: T[];
    children: FolderNode<T>[];
}

export interface FolderTree<T> {
    items: T[];
    children: FolderNode<T>[];
}

export function buildFolderTree<T>(items: T[], folderOf: (item: T) => string | undefined): FolderTree<T> {
    const root: FolderTree<T> = { items: [], children: [] };
    const nodesByPath = new Map<string, FolderNode<T>>();

    items.forEach((item) => {
        const segments = (folderOf(item) ?? '').split('/').filter((segment) => segment.length > 0);
        if (segments.length === 0) {
            root.items.push(item);
            return;
        }

        let siblings = root.children;
        let path = '';
        let leaf: FolderNode<T> | undefined;
        segments.forEach((segment) => {
            path = path ? `${path}/${segment}` : segment;
            let node = nodesByPath.get(path);
            if (!node) {
                node = { name: segment, path, items: [], children: [] };
                nodesByPath.set(path, node);
                siblings.push(node);
            }
            siblings = node.children;
            leaf = node;
        });
        leaf?.items.push(item);
    });

    return root;
}

// Child folders first, then the node's own items — the same order the tree is rendered in.
export function collectFolderItems<T>(node: FolderNode<T>): T[] {
    return [...node.children.flatMap(collectFolderItems), ...node.items];
}
