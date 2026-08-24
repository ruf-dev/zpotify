import { useState } from 'react';
import { Button } from '@vervstack/chures';

import { groupTracksByFolder, folderProgress } from '@/dialogs/MultitrackUpload/groupTracksByFolder';
import FolderGroupHeader from '@/components/FolderGroupHeader/FolderGroupHeader';
import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';
import UploadingFileRow from '@/dialogs/AddTrack/screens/components/UploadingFileRow/UploadingFileRow';
import cls from '@/dialogs/AddTrack/screens/components/BatchUploadSection/BatchUploadSection.module.css';

interface BatchUploadSectionProps {
    tracks: TrackDraft[];
    onOpenFolder: (folderName: string) => void;
}

function isFolderSettled(tracks: TrackDraft[]): boolean {
    return tracks.every((t) => t.uploadStatus === 'done' || t.uploadStatus === 'error');
}

export default function BatchUploadSection(props: BatchUploadSectionProps) {
    const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());

    const segments = groupTracksByFolder(props.tracks);

    function toggleFolder(folderName: string) {
        setCollapsedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(folderName)) next.delete(folderName);
            else next.add(folderName);
            return next;
        });
    }

    return (
        <div className={cls.BatchUploadSectionContainer}>
            <span className={cls.SectionLabel}>uploading</span>

            <div className={cls.RowsWrapper}>
                {segments.flatMap((segment) => {
                    if (segment.folderName === undefined) {
                        return segment.tracks.map((track) => <UploadingFileRow key={track.id} track={track} />);
                    }

                    const folderName = segment.folderName;
                    const collapsed = collapsedFolders.has(folderName);
                    const nodes = [
                        <FolderGroupHeader
                            key={`folder-header-${folderName}-${segment.startIndex}`}
                            name={folderName}
                            trackCount={segment.tracks.length}
                            progress={folderProgress(segment.tracks)}
                            collapsed={collapsed}
                            onToggle={() => toggleFolder(folderName)}
                        />,
                    ];

                    if (isFolderSettled(segment.tracks)) {
                        nodes.push(
                            <Button
                                key={`folder-action-${folderName}-${segment.startIndex}`}
                                type="button"
                                variant="ghost"
                                className={cls.CreatePlaylistButton}
                                onClick={() => props.onOpenFolder(folderName)}
                            >
                                create playlist from this folder
                            </Button>,
                        );
                    }

                    if (!collapsed) {
                        nodes.push(
                            <div
                                key={`folder-tracks-${folderName}-${segment.startIndex}`}
                                className={cls.FolderTrackIndent}
                            >
                                {segment.tracks.map((track) => (
                                    <UploadingFileRow key={track.id} track={track} />
                                ))}
                            </div>,
                        );
                    }

                    return nodes;
                })}
            </div>
        </div>
    );
}
