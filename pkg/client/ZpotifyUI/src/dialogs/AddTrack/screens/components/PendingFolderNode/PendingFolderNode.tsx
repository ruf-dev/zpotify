import { useMemo } from 'react';
import type { ReactNode } from 'react';
import cn from 'classnames';

import FolderGroupHeader from '@/components/FolderGroupHeader/FolderGroupHeader';
import cls from '@/dialogs/AddTrack/screens/components/PendingFolderNode/PendingFolderNode.module.css';
import { collectFolderItems } from '@/shared/lib/folderTree.ts';
import type { FolderNode } from '@/shared/lib/folderTree.ts';
import type { SongFile } from '@/app/api/zpotify';

interface PendingFolderNodeProps {
    node: FolderNode<SongFile>;
    expandedPaths: Set<string>;
    selectedIds: Set<string>;
    onToggle: (path: string) => void;
    onToggleSelectFolder: (ids: string[], checked: boolean) => void;
    onCreatePlaylist: (folderName: string, files: SongFile[]) => void;
    renderFile: (file: SongFile) => ReactNode;
}

export default function PendingFolderNode(props: PendingFolderNodeProps) {
    const { node } = props;
    const files = useMemo(() => collectFolderItems(node), [node]);
    const collapsed = !props.expandedPaths.has(node.path);
    const folderSelected = files.length > 0 && files.every((f) => props.selectedIds.has(f.id ?? ''));

    return (
        <div className={cls.PendingFolderNodeContainer}>
            <FolderGroupHeader
                name={node.name}
                trackCount={files.length}
                progress={100}
                collapsed={collapsed}
                onToggle={() => props.onToggle(node.path)}
                folderSelected={folderSelected}
                onToggleSelectFolder={(checked) =>
                    props.onToggleSelectFolder(
                        files.map((f) => f.id ?? ''),
                        checked,
                    )
                }
                onCreatePlaylist={() => props.onCreatePlaylist(node.name, files)}
            />
            <div className={cn(cls.FolderTrackIndent, !collapsed && cls.FolderTrackIndentExpanded)}>
                <div className={cls.FolderTrackIndentInner}>
                    {node.children.map((child) => (
                        <PendingFolderNode
                            key={child.path}
                            node={child}
                            expandedPaths={props.expandedPaths}
                            selectedIds={props.selectedIds}
                            onToggle={props.onToggle}
                            onToggleSelectFolder={props.onToggleSelectFolder}
                            onCreatePlaylist={props.onCreatePlaylist}
                            renderFile={props.renderFile}
                        />
                    ))}
                    {node.items.map(props.renderFile)}
                </div>
            </div>
        </div>
    );
}
