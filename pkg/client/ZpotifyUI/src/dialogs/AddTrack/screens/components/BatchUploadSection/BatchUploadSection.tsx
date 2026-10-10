import { useState } from 'react';
import { Button } from '@vervstack/chures';

import { groupTracksByFolder } from '@/dialogs/MultitrackUpload/groupTracksByFolder';
import type { TrackGroupEntry, TrackGroupFolder } from '@/dialogs/MultitrackUpload/groupTracksByFolder';
import TrackFolderNode from '@/dialogs/MultitrackUpload/components/TrackFolderNode/TrackFolderNode';
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

function renderTrack(track: TrackDraft) {
    return <UploadingFileRow key={track.id} track={track} />;
}

export default function BatchUploadSection(props: BatchUploadSectionProps) {
    const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());

    const entries = groupTracksByFolder(props.tracks);

    function toggleFolder(path: string) {
        setCollapsedPaths((prev) => {
            const next = new Set(prev);
            if (next.has(path)) next.delete(path);
            else next.add(path);
            return next;
        });
    }

    function renderFolderActions(folder: TrackGroupFolder, depth: number) {
        if (depth > 0 || !isFolderSettled(folder.tracks)) return null;
        return (
            <Button
                type="button"
                variant="ghost"
                className={cls.CreatePlaylistButton}
                onClick={() => props.onOpenFolder(folder.path)}
            >
                create playlist from this folder
            </Button>
        );
    }

    function renderEntry(entry: TrackGroupEntry) {
        if (entry.kind === 'track') return renderTrack(entry.track);
        return (
            <TrackFolderNode
                key={`folder-${entry.folder.path}-${entry.folder.startIndex}`}
                folder={entry.folder}
                depth={0}
                collapsedPaths={collapsedPaths}
                onToggle={toggleFolder}
                renderTrack={renderTrack}
                renderActions={renderFolderActions}
            />
        );
    }

    return (
        <div className={cls.BatchUploadSectionContainer}>
            <span className={cls.SectionLabel}>uploading</span>

            <div className={cls.RowsWrapper}>{entries.map(renderEntry)}</div>
        </div>
    );
}
