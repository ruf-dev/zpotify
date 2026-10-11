import { useMemo } from 'react';
import cn from 'classnames';

import type { TorrentFileEntry } from '@/app/api/zpotify';
import FolderGroupHeader from '@/components/FolderGroupHeader/FolderGroupHeader';
import cls from '@/dialogs/AddTrack/screens/components/TorrentFolderNode/TorrentFolderNode.module.css';
import TorrentFileRow from '@/dialogs/AddTrack/screens/components/TorrentFileRow/TorrentFileRow';
import { folderContentsLabel, folderSelectionState } from '@/dialogs/AddTrack/screens/processes/torrentFileTree.ts';
import { collectFolderItems } from '@/shared/lib/folderTree.ts';
import type { FolderNode } from '@/shared/lib/folderTree.ts';

interface TorrentFolderNodeProps {
    node: FolderNode<TorrentFileEntry>;
    collapsedPaths: Set<string>;
    selectedPaths: Set<string>;
    onToggleCollapse: (path: string) => void;
    onSetFolderSelected: (paths: string[], checked: boolean) => void;
    onToggleSelect: (path: string) => void;
}

export default function TorrentFolderNode(props: TorrentFolderNodeProps) {
    const { node } = props;
    const selection = useMemo(() => folderSelectionState(node, props.selectedPaths), [node, props.selectedPaths]);
    const countLabel = useMemo(() => folderContentsLabel(collectFolderItems(node)), [node]);
    const collapsed = props.collapsedPaths.has(node.path);

    function handleToggle() {
        props.onToggleCollapse(node.path);
    }

    function handleToggleSelectFolder(checked: boolean) {
        props.onSetFolderSelected(selection.supportedPaths, checked);
    }

    return (
        <div className={cls.TorrentFolderNodeContainer}>
            <FolderGroupHeader
                name={node.name}
                trackCount={selection.supportedPaths.length}
                countLabel={countLabel}
                progress={0}
                collapsed={collapsed}
                onToggle={handleToggle}
                folderSelected={selection.isChecked}
                isFolderPartial={selection.isPartial}
                isSelectFolderDisabled={selection.supportedPaths.length === 0}
                onToggleSelectFolder={handleToggleSelectFolder}
            />
            <div className={cn(cls.FolderTrackIndent, !collapsed && cls.FolderTrackIndentExpanded)}>
                <div className={cls.FolderTrackIndentInner}>
                    {node.children.map((child) => (
                        <TorrentFolderNode
                            key={child.path}
                            node={child}
                            collapsedPaths={props.collapsedPaths}
                            selectedPaths={props.selectedPaths}
                            onToggleCollapse={props.onToggleCollapse}
                            onSetFolderSelected={props.onSetFolderSelected}
                            onToggleSelect={props.onToggleSelect}
                        />
                    ))}
                    {node.items.map((entry) => (
                        <TorrentFileRow
                            key={entry.path}
                            entry={entry}
                            selected={props.selectedPaths.has(entry.path ?? '')}
                            onToggleSelect={props.onToggleSelect}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
