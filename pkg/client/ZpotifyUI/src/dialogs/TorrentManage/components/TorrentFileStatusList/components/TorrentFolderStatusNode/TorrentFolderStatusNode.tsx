import { useMemo } from 'react';
import cn from 'classnames';

import FolderGroupHeader from '@/components/FolderGroupHeader/FolderGroupHeader';
import cls from '@/dialogs/TorrentManage/components/TorrentFileStatusList/components/TorrentFolderStatusNode/TorrentFolderStatusNode.module.css';
import TorrentFileStatusRow from '@/dialogs/TorrentManage/components/TorrentFileStatusList/components/TorrentFileStatusRow/TorrentFileStatusRow';
import { folderProgressPercent } from '@/dialogs/TorrentManage/processes/buildTorrentFileTree';
import type { TorrentFileRow } from '@/dialogs/TorrentManage/processes/mergeTorrentFiles';
import { collectFolderItems } from '@/shared/lib/folderTree.ts';
import type { FolderNode } from '@/shared/lib/folderTree.ts';

interface TorrentFolderStatusNodeProps {
    node: FolderNode<TorrentFileRow>;
    collapsedPaths: Set<string>;
    onToggle: (path: string) => void;
}

export default function TorrentFolderStatusNode({ node, collapsedPaths, onToggle }: TorrentFolderStatusNodeProps) {
    const files = useMemo(() => collectFolderItems(node), [node]);
    const progress = useMemo(() => folderProgressPercent(files), [files]);
    const collapsed = collapsedPaths.has(node.path);
    const countLabel = files.length === 1 ? '1 file' : `${files.length} files`;

    function handleToggle() {
        onToggle(node.path);
    }

    return (
        <div className={cls.TorrentFolderStatusNodeContainer}>
            <FolderGroupHeader
                name={node.name}
                trackCount={files.length}
                countLabel={countLabel}
                progress={progress}
                collapsed={collapsed}
                onToggle={handleToggle}
            />
            <div className={cn(cls.FolderRowIndent, !collapsed && cls.FolderRowIndentExpanded)}>
                <div className={cls.FolderRowIndentInner}>
                    {node.children.map((child) => (
                        <TorrentFolderStatusNode
                            key={child.path}
                            node={child}
                            collapsedPaths={collapsedPaths}
                            onToggle={onToggle}
                        />
                    ))}
                    {node.items.map((file) => (
                        <TorrentFileStatusRow key={file.path} file={file} />
                    ))}
                </div>
            </div>
        </div>
    );
}
