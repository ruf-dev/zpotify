import type { ReactNode } from 'react';

import FolderGroupHeader from '@/components/FolderGroupHeader/FolderGroupHeader';
import cls from '@/dialogs/MultitrackUpload/components/TrackFolderNode/TrackFolderNode.module.css';
import { folderProgress } from '@/dialogs/MultitrackUpload/groupTracksByFolder';
import type { TrackGroupFolder } from '@/dialogs/MultitrackUpload/groupTracksByFolder';
import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';

interface TrackFolderNodeProps {
    folder: TrackGroupFolder;
    depth: number;
    collapsedPaths: Set<string>;
    onToggle: (path: string) => void;
    renderTrack: (track: TrackDraft, index: number) => ReactNode;
    renderActions?: (folder: TrackGroupFolder, depth: number) => ReactNode;
}

export default function TrackFolderNode(props: TrackFolderNodeProps) {
    const { folder } = props;
    const collapsed = props.collapsedPaths.has(folder.path);

    return (
        <>
            <FolderGroupHeader
                name={folder.name}
                trackCount={folder.tracks.length}
                progress={folderProgress(folder.tracks)}
                collapsed={collapsed}
                onToggle={() => props.onToggle(folder.path)}
            />
            {props.renderActions?.(folder, props.depth)}
            {!collapsed && (
                <div className={cls.TrackFolderNodeContainer}>
                    {folder.entries.map((entry) =>
                        entry.kind === 'track' ? (
                            props.renderTrack(entry.track, entry.index)
                        ) : (
                            <TrackFolderNode
                                key={`folder-${entry.folder.path}-${entry.folder.startIndex}`}
                                folder={entry.folder}
                                depth={props.depth + 1}
                                collapsedPaths={props.collapsedPaths}
                                onToggle={props.onToggle}
                                renderTrack={props.renderTrack}
                                renderActions={props.renderActions}
                            />
                        ),
                    )}
                </div>
            )}
        </>
    );
}
