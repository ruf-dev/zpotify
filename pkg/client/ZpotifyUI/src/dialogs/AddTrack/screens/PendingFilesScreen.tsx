import { useMemo, useState } from 'react';
import { Button } from '@vervstack/chures';

import cls from '@/dialogs/AddTrack/screens/PendingFilesScreen.module.css';
import { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';
import FileItem from '@/dialogs/AddTrack/screens/components/FileItem/FileItem';
import TorrentJobItem from '@/dialogs/AddTrack/screens/components/TorrentJobItem/TorrentJobItem';
import PendingFolderNode from '@/dialogs/AddTrack/screens/components/PendingFolderNode/PendingFolderNode';
import BatchUploadSection from '@/dialogs/AddTrack/screens/components/BatchUploadSection/BatchUploadSection';
import Checkbox from '@/components/Checkbox/Checkbox';
import { usePendingFiles } from '@/dialogs/AddTrack/screens/usePendingFiles.tsx';
import { useTorrentJobs } from '@/dialogs/AddTrack/screens/useTorrentJobs.ts';
import { parseSongFilePath } from '@/dialogs/AddTrack/screens/parseSongFilePath.ts';
import { buildFolderTree } from '@/shared/lib/folderTree.ts';
import { isTerminalTorrentStatus } from '@/shared/lib/torrentStatus.ts';
import type { SongFile } from '@/app/api/zpotify';

export default function PendingFilesScreen({
    handleSelectFromLibrary,
    handleManageTorrent,
    batchTracks,
    handleOpenBatchFolder,
    handleCreatePlaylistFromFolder,
}: AddTrackContext) {
    const pendingFiles = usePendingFiles();
    const torrentJobs = useTorrentJobs();
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
    const folderTree = useMemo(
        () => buildFolderTree(pendingFiles.files, (file) => parseSongFilePath(file.path).folderName),
        [pendingFiles.files],
    );

    function toggleFolder(path: string) {
        setExpandedPaths((prev) => {
            const next = new Set(prev);
            if (next.has(path)) next.delete(path);
            else next.add(path);
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

    function renderTorrentJobs() {
        if (torrentJobs.jobs.length === 0) return null;
        return (
            <div className={cls.TorrentJobList}>
                {torrentJobs.jobs.map((job) => (
                    <TorrentJobItem key={job.id} job={job} onManage={handleManageTorrent} />
                ))}
            </div>
        );
    }

    if (pendingFiles.loading) {
        return (
            <div className={cls.PendingFilesScreenContainer}>
                {renderTorrentJobs()}
                <div className={cls.Loading}>loading files…</div>
            </div>
        );
    }

    const hasActiveTorrentJob = torrentJobs.jobs.some((job) => !isTerminalTorrentStatus(job.status));

    return (
        <div className={cls.PendingFilesScreenContainer}>
            {renderTorrentJobs()}
            {batchTracks.length > 0 && <BatchUploadSection tracks={batchTracks} onOpenFolder={handleOpenBatchFolder} />}
            {pendingFiles.files.length === 0 ? (
                <div className={cls.Empty}>
                    {hasActiveTorrentJob ? 'track will be downloaded soon' : 'no pending uploads found'}
                </div>
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
                        {folderTree.children.map((node) => (
                            <PendingFolderNode
                                key={node.path}
                                node={node}
                                expandedPaths={expandedPaths}
                                selectedIds={pendingFiles.selectedIds}
                                onToggle={toggleFolder}
                                onToggleSelectFolder={pendingFiles.handleToggleSelectFolder}
                                onCreatePlaylist={handleCreatePlaylistFromFolder}
                                renderFile={renderFileItem}
                            />
                        ))}
                        {folderTree.items.map(renderFileItem)}
                    </div>
                </>
            )}
        </div>
    );
}
