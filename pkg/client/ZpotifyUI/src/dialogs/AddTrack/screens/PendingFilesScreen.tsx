import { useState } from 'react';
import { Button } from '@vervstack/chures';

import cls from '@/dialogs/AddTrack/screens/PendingFilesScreen.module.css';
import { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';
import FileItem from '@/dialogs/AddTrack/screens/components/FileItem/FileItem';
import BatchUploadSection from '@/dialogs/AddTrack/screens/components/BatchUploadSection/BatchUploadSection';
import Checkbox from '@/components/Checkbox/Checkbox';
import FolderGroupHeader from '@/components/FolderGroupHeader/FolderGroupHeader';
import { usePendingFiles } from '@/dialogs/AddTrack/screens/usePendingFiles.tsx';
import { parseSongFilePath } from '@/dialogs/AddTrack/screens/parseSongFilePath.ts';
import type { SongFile } from '@/app/api/zpotify';

interface GroupedFiles {
    folders: Map<string, SongFile[]>;
    ungrouped: SongFile[];
}

function groupFilesByFolder(files: SongFile[]): GroupedFiles {
    const folders = new Map<string, SongFile[]>();
    const ungrouped: SongFile[] = [];

    files.forEach((file) => {
        const { folderName } = parseSongFilePath(file.path);
        if (folderName === undefined) {
            ungrouped.push(file);
            return;
        }
        const group = folders.get(folderName);
        if (group) {
            group.push(file);
        } else {
            folders.set(folderName, [file]);
        }
    });

    return { folders, ungrouped };
}

function isFolderSelected(groupFiles: SongFile[], selectedIds: Set<string>): boolean {
    return groupFiles.length > 0 && groupFiles.every((f) => selectedIds.has(f.id ?? ''));
}

export default function PendingFilesScreen({
    handleSelectFromLibrary,
    batchTracks,
    handleOpenBatchFolder,
    handleCreatePlaylistFromFolder,
}: AddTrackContext) {
    const pendingFiles = usePendingFiles();
    const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());

    function toggleFolder(folderName: string) {
        setCollapsedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(folderName)) next.delete(folderName);
            else next.add(folderName);
            return next;
        });
    }

    function renderFileItem(file: SongFile) {
        return (
            <FileItem
                key={file.id}
                file={file}
                selected={pendingFiles.selectedIds.has(file.id ?? '')}
                onSelect={handleSelectFromLibrary}
                onDelete={pendingFiles.handleDelete}
                onToggleSelect={pendingFiles.handleToggleSelect}
            />
        );
    }

    if (pendingFiles.loading) {
        return (
            <div className={cls.PendingFilesScreenContainer}>
                <div className={cls.Loading}>loading files…</div>
            </div>
        );
    }

    const grouped = groupFilesByFolder(pendingFiles.files);

    return (
        <div className={cls.PendingFilesScreenContainer}>
            {batchTracks.length > 0 && <BatchUploadSection tracks={batchTracks} onOpenFolder={handleOpenBatchFolder} />}
            {pendingFiles.files.length === 0 ? (
                <div className={cls.Empty}>no pending uploads found</div>
            ) : (
                <>
                    <div className={cls.ActionsRow}>
                        <Checkbox
                            checked={pendingFiles.allSelected}
                            onChange={pendingFiles.handleToggleSelectAll}
                            label="Select all"
                        />
                        <div className={cls.ActionsRight}>
                            <Button variant="ghost" onClick={pendingFiles.refetch} disabled={pendingFiles.refetching}>
                                {pendingFiles.refetching ? 'refreshing…' : 'Refresh'}
                            </Button>
                            <Button
                                variant="danger"
                                disabled={pendingFiles.selectedIds.size === 0}
                                onClick={pendingFiles.handleDeleteSelected}
                            >
                                Delete selected ({pendingFiles.selectedIds.size})
                            </Button>
                        </div>
                    </div>
                    <div className={cls.FileList}>
                        {Array.from(grouped.folders.entries()).map(([folderName, groupFiles]) => {
                            const collapsed = collapsedFolders.has(folderName);
                            const folderSelected = isFolderSelected(groupFiles, pendingFiles.selectedIds);
                            return (
                                <div key={folderName} className={cls.FolderGroup}>
                                    <FolderGroupHeader
                                        name={folderName}
                                        trackCount={groupFiles.length}
                                        progress={100}
                                        collapsed={collapsed}
                                        onToggle={() => toggleFolder(folderName)}
                                        folderSelected={folderSelected}
                                        onToggleSelectFolder={(checked) =>
                                            pendingFiles.handleToggleSelectFolder(
                                                groupFiles.map((f) => f.id ?? ''),
                                                checked,
                                            )
                                        }
                                        onCreatePlaylist={() => handleCreatePlaylistFromFolder(folderName, groupFiles)}
                                    />
                                    {!collapsed && (
                                        <div className={cls.FolderTrackIndent}>{groupFiles.map(renderFileItem)}</div>
                                    )}
                                </div>
                            );
                        })}
                        {grouped.ungrouped.map(renderFileItem)}
                    </div>
                </>
            )}
        </div>
    );
}
