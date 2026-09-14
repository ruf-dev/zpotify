import { useMemo, type KeyboardEvent } from 'react';
import cn from 'classnames';

import type { TorrentJob } from '@/app/api/zpotify';
import cls from '@/dialogs/AddTrack/screens/components/RecentTorrentsPanel/RecentTorrentsPanel.module.css';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import TorrentManageDialog from '@/dialogs/TorrentManage/TorrentManageDialog.tsx';
import { formatFileSize } from '@/shared/lib/files.ts';

interface RecentTorrentsPanelProps {
    jobs: TorrentJob[];
    loading: boolean;
}

function getStatusDotColor(status?: string): string {
    if (status === 'done') return cls.StatusDone;
    if (status === 'downloading') return cls.StatusDownloading;
    if (status === 'paused') return cls.StatusPaused;
    return cls.StatusDefault;
}

export default function RecentTorrentsPanel({ jobs, loading }: RecentTorrentsPanelProps) {
    const { OpenDialog } = useDialog();

    const displayedJobs = useMemo(() => {
        return jobs.slice(0, 3);
    }, [jobs]);

    function handleRowClick(job: TorrentJob) {
        OpenDialog(<TorrentManageDialog job={job} />);
    }

    return (
        <div className={cls.RecentTorrentsPanelContainer}>
            <div className={cls.PanelHeader}>
                <span className={cls.PanelTitle}>recent torrents</span>
            </div>

            <div className={cls.JobsList}>
                {loading && displayedJobs.length === 0 ? (
                    <>
                        <div className={cls.SkeletonRow} />
                        <div className={cls.SkeletonRow} />
                        <div className={cls.SkeletonRow} />
                    </>
                ) : displayedJobs.length > 0 ? (
                    displayedJobs.map((job) => {
                        const total = Number(job.totalBytes ?? 0);
                        const downloaded = Number(job.downloadedBytes ?? 0);
                        const progress = total > 0 ? Math.min(1, downloaded / total) : 0;
                        const progressPercent = `${Math.round(progress * 100)}%`;

                        function handleKeyDown(e: KeyboardEvent) {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleRowClick(job);
                            }
                        }

                        return (
                            <div
                                key={job.id}
                                className={cls.JobRow}
                                onClick={() => handleRowClick(job)}
                                onKeyDown={handleKeyDown}
                                role="button"
                                tabIndex={0}
                            >
                                <div className={cn(cls.StatusDot, getStatusDotColor(job.status))} />

                                <div className={cls.JobInfo}>
                                    <span className={cls.JobName}>{job.torrentName}</span>
                                    <div className={cls.JobMeta}>
                                        <span className={cls.JobStatus}>{job.status}</span>
                                        <span className={cls.JobProgress}>{progressPercent}</span>
                                        <span className={cls.JobSize}>
                                            {formatFileSize(downloaded)} / {formatFileSize(total)}
                                        </span>
                                    </div>
                                </div>

                                <div className={cls.FilesInfo}>
                                    <span className={cls.FilesLabel}>{job.importedFiles?.length ?? 0} files</span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className={cls.EmptyState}>
                        <span className={cls.EmptyStateMessage}>No recent torrents</span>
                    </div>
                )}
            </div>
        </div>
    );
}
