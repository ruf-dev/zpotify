import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import cn from 'classnames';

import cls from '@/dialogs/AddTrack/screens/DropZoneScreen.module.css';
import { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';
import { AUDIO_ACCEPT } from '@/features/upload/supportedAudio.ts';
import { TORRENT_EXTENSION, isTorrentFile, isTorrentFileName } from '@/features/upload/torrentFile.ts';
import { resolveDroppedEntries, type DroppedGroups } from '@/features/upload/resolveDroppedEntries.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import IdleDecoration from '@/dialogs/AddTrack/screens/components/IdleDecoration/IdleDecoration';
import DragOverDecoration from '@/dialogs/AddTrack/screens/components/DragOverDecoration/DragOverDecoration';
import DropZoneIcon from '@/dialogs/AddTrack/screens/components/DropZoneIcon/DropZoneIcon';
import DropZoneText from '@/dialogs/AddTrack/screens/components/DropZoneText/DropZoneText';
import UploadingSpinner from '@/dialogs/AddTrack/screens/components/UploadingSpinner/UploadingSpinner';

function readEntryAsFile(entry: FileSystemFileEntry): Promise<File> {
    return new Promise((resolve, reject) => {
        entry.file(resolve, reject);
    });
}

export default function DropZoneScreen({
    handleFiles,
    handleTorrentFile,
    handleDroppedGroups,
    uploadError,
    uploading,
}: AddTrackContext) {
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const toaster = useToaster();

    if (uploading) {
        return <UploadingSpinner />;
    }

    function handleResolvedGroups(groups: DroppedGroups) {
        if (groups.ignoredNestedCount > 0) {
            toaster.bake({
                title: 'nested folders skipped',
                description: `only 1 level of folders is supported — ${groups.ignoredNestedCount} nested folder${groups.ignoredNestedCount === 1 ? '' : 's'} ignored`,
                level: 'Warn',
                isDismissable: true,
            });
        }

        if (groups.folders.length === 0) {
            if (groups.looseFiles.length > 0) handleFiles(groups.looseFiles);
            return;
        }

        handleDroppedGroups(groups);
    }

    function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragOver(false);

        const entries = Array.from(e.dataTransfer.items)
            .map((item) => item.webkitGetAsEntry?.())
            .filter((entry): entry is FileSystemEntry => entry !== null && entry !== undefined);

        if (entries.length === 0) {
            const files = Array.from(e.dataTransfer.files);
            files.filter(isTorrentFile).forEach((file) => handleTorrentFile(file));
            const nonTorrentFiles = files.filter((f) => !isTorrentFile(f));
            if (nonTorrentFiles.length > 0) handleFiles(nonTorrentFiles);
            return;
        }

        const torrentEntries = entries.filter(
            (entry): entry is FileSystemFileEntry => entry.isFile && isTorrentFileName(entry.name),
        );
        torrentEntries.forEach((entry) => {
            readEntryAsFile(entry).then(handleTorrentFile);
        });

        const torrentEntrySet = new Set<FileSystemEntry>(torrentEntries);
        const remainingEntries = entries.filter((entry) => !torrentEntrySet.has(entry));
        if (remainingEntries.length === 0) return;

        resolveDroppedEntries(remainingEntries).then(handleResolvedGroups);
    }

    function handleDragOver(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragOver(true);
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;

        files.filter(isTorrentFile).forEach((file) => handleTorrentFile(file));
        const nonTorrentFiles = files.filter((f) => !isTorrentFile(f));
        if (nonTorrentFiles.length > 0) handleFiles(nonTorrentFiles);
    }

    function handleClick() {
        inputRef.current?.click();
    }

    function handleDragLeave() {
        setDragOver(false);
    }

    return (
        <div className={cls.DropZoneScreenContainer}>
            <div
                className={cn(cls.DropZone, dragOver && cls.DropZoneDragOver)}
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={`${AUDIO_ACCEPT},${TORRENT_EXTENSION}`}
                    multiple
                    className={cls.HiddenInput}
                    onChange={handleInputChange}
                />

                {dragOver ? <DragOverDecoration /> : <IdleDecoration />}

                <div className={cls.CenterContent}>
                    <DropZoneIcon dragOver={dragOver} />
                    <DropZoneText dragOver={dragOver} />
                </div>

                {!dragOver && <span className={cls.BottomHint}>mp3 · flac · aac</span>}
            </div>

            {uploadError && <span className={cls.UploadError}>{uploadError}</span>}
        </div>
    );
}
