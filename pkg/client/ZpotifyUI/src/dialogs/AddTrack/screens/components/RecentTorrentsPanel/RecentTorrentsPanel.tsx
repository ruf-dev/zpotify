import { useMemo, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import cn from 'classnames';

import type { TorrentJob } from '@/app/api/zpotify';
import cls from '@/dialogs/AddTrack/screens/components/RecentTorrentsPanel/RecentTorrentsPanel.module.css';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import TorrentManageDialog from '@/dialogs/TorrentManage/TorrentManageDialog.tsx';
import TorrentJobRow from '@/dialogs/AddTrack/screens/components/RecentTorrentsPanel/components/TorrentJobRow/TorrentJobRow.tsx';
import { DownloadIcon } from '@/assets/icons/DownloadIcon';
import { TORRENT_EXTENSION } from '@/features/upload/torrentFile.ts';

interface RecentTorrentsPanelProps {
    jobs: TorrentJob[];
    loading: boolean;
    onFile: (file: File) => void;
}

const SKELETON_ROW_KEYS = ['skeleton-1', 'skeleton-2', 'skeleton-3'];

export default function RecentTorrentsPanel({ jobs, loading, onFile }: RecentTorrentsPanelProps) {
    const { OpenDialog } = useDialog();
    const inputRef = useRef<HTMLInputElement>(null);

    const displayedJobs = useMemo(() => {
        return jobs.slice(0, 3);
    }, [jobs]);

    const isEmpty = !loading && displayedJobs.length === 0;

    function handleRowClick(job: TorrentJob) {
        OpenDialog(<TorrentManageDialog job={job} />);
    }

    function handleAddTorrentClick() {
        inputRef.current?.click();
    }

    function handleAddTorrentKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleAddTorrentClick();
        }
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            onFile(file);
        }
        e.target.value = '';
    }

    return (
        <div className={cls.RecentTorrentsPanelContainer}>
            <input
                ref={inputRef}
                type="file"
                accept={TORRENT_EXTENSION}
                className={cls.HiddenInput}
                onChange={handleInputChange}
            />

            <div className={cls.PanelHeader}>
                <span className={cls.PanelTitle}>recent torrents</span>
                {!isEmpty && (
                    <div
                        className={cls.AddTorrentTrigger}
                        onClick={handleAddTorrentClick}
                        onKeyDown={handleAddTorrentKeyDown}
                        role="button"
                        tabIndex={0}
                    >
                        <DownloadIcon />
                        <span>add torrent</span>
                    </div>
                )}
            </div>

            <div className={cls.JobsList}>
                {loading && displayedJobs.length === 0 ? (
                    <>
                        {SKELETON_ROW_KEYS.map((key) => (
                            <div key={key} className={cls.SkeletonRow}>
                                <div className={cls.SkeletonDot} />
                                <div className={cls.SkeletonInfo}>
                                    <div className={cn(cls.SkeletonLine, cls.SkeletonLineName)} />
                                    <div className={cls.SkeletonMetaRow}>
                                        <div className={cn(cls.SkeletonLine, cls.SkeletonChip)} />
                                        <div className={cn(cls.SkeletonLine, cls.SkeletonChip)} />
                                        <div className={cn(cls.SkeletonLine, cls.SkeletonChipWide)} />
                                    </div>
                                </div>
                                <div className={cn(cls.SkeletonLine, cls.SkeletonLineFiles)} />
                            </div>
                        ))}
                    </>
                ) : displayedJobs.length > 0 ? (
                    displayedJobs.map((job) => <TorrentJobRow key={job.id} job={job} onClick={handleRowClick} />)
                ) : (
                    <div
                        className={cls.EmptyState}
                        onClick={handleAddTorrentClick}
                        onKeyDown={handleAddTorrentKeyDown}
                        role="button"
                        tabIndex={0}
                    >
                        <div className={cls.EmptyStateIconCircle}>
                            <DownloadIcon />
                        </div>
                        <div className={cls.EmptyStateText}>
                            <span className={cls.EmptyStateTitle}>add torrent</span>
                            <span className={cls.EmptyStateSubtitle}>upload a .torrent file to start downloading</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
