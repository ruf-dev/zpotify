import { useMemo, useState } from 'react';
import { Button } from '@vervstack/chures';

import cls from '@/dialogs/AddTrack/screens/TorrentFilesScreen.module.css';
import { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';
import Checkbox from '@/components/Checkbox/Checkbox';
import ResolvingTorrentStatus from '@/dialogs/AddTrack/screens/components/ResolvingTorrentStatus/ResolvingTorrentStatus';
import TorrentFolderNode from '@/dialogs/AddTrack/screens/components/TorrentFolderNode/TorrentFolderNode';
import TorrentFileRow from '@/dialogs/AddTrack/screens/components/TorrentFileRow/TorrentFileRow';
import { collectFolderPaths } from '@/dialogs/AddTrack/screens/processes/torrentFileTree.ts';
import { useTorrentFileSelection } from '@/dialogs/AddTrack/screens/useTorrentFileSelection.ts';

export default function TorrentFilesScreen({
    pendingTorrentUpload,
    handleSubmitTorrentFile,
    submittingTorrentFile,
    discardPendingTorrentUpload,
    goTo,
}: AddTrackContext) {
    const selection = useTorrentFileSelection(pendingTorrentUpload?.id ?? '');
    const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());

    const folderPaths = useMemo(() => collectFolderPaths(selection.tree), [selection.tree]);
    const isAnyFolderExpanded = folderPaths.some((path) => !collapsedPaths.has(path));

    function handleToggleCollapseAll() {
        setCollapsedPaths(isAnyFolderExpanded ? new Set(folderPaths) : new Set());
    }

    function handleToggleCollapse(path: string) {
        setCollapsedPaths((prev) => {
            const next = new Set(prev);
            if (next.has(path)) next.delete(path);
            else next.add(path);
            return next;
        });
    }

    function handleCancel() {
        discardPendingTorrentUpload();
        goTo('choose');
    }

    function handleSubmit() {
        handleSubmitTorrentFile(Array.from(selection.selectedPaths), selection.torrentName);
    }

    if (!pendingTorrentUpload) {
        return <div className={cls.TorrentFilesScreenContainer} />;
    }

    if (selection.loading) {
        return (
            <div className={cls.TorrentFilesScreenContainer}>
                <div className={cls.Loading}>loading torrent files…</div>
            </div>
        );
    }

    if (selection.failed) {
        return (
            <div className={cls.TorrentFilesScreenContainer}>
                <div className={cls.FailedMessage}>could not fetch torrent metadata from peers</div>
                <div className={cls.SubmitRow}>
                    <Button variant="ghost" onClick={handleCancel}>
                        Back
                    </Button>
                </div>
            </div>
        );
    }

    if (selection.resolving) {
        return (
            <div className={cls.TorrentFilesScreenContainer}>
                <ResolvingTorrentStatus torrentName={selection.torrentName} onCancel={handleCancel} />
            </div>
        );
    }

    return (
        <div className={cls.TorrentFilesScreenContainer}>
            <span className={cls.TorrentName}>{selection.torrentName}</span>

            <div className={cls.ActionsRow}>
                <Checkbox
                    checked={selection.allSelected}
                    isIndeterminate={selection.isPartiallySelected}
                    onChange={selection.handleToggleSelectAll}
                    label="Select all"
                />
                {folderPaths.length > 0 && (
                    <Button variant="ghost" onClick={handleToggleCollapseAll}>
                        {isAnyFolderExpanded ? 'Collapse all' : 'Expand all'}
                    </Button>
                )}
            </div>

            <div className={cls.FileList}>
                {selection.tree.children.map((node) => (
                    <TorrentFolderNode
                        key={node.path}
                        node={node}
                        collapsedPaths={collapsedPaths}
                        selectedPaths={selection.selectedPaths}
                        onToggleCollapse={handleToggleCollapse}
                        onSetFolderSelected={selection.handleSetFolderSelected}
                        onToggleSelect={selection.handleToggleSelect}
                    />
                ))}
                {selection.tree.items.map((entry) => (
                    <TorrentFileRow
                        key={entry.path}
                        entry={entry}
                        selected={selection.selectedPaths.has(entry.path ?? '')}
                        onToggleSelect={selection.handleToggleSelect}
                    />
                ))}
            </div>

            <div className={cls.SubmitRow}>
                <Button variant="ghost" onClick={handleCancel} disabled={submittingTorrentFile}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={selection.selectedPaths.size === 0 || submittingTorrentFile}
                >
                    {submittingTorrentFile ? 'submitting…' : `Download ${selection.selectedPaths.size} selected`}
                </Button>
            </div>
        </div>
    );
}
