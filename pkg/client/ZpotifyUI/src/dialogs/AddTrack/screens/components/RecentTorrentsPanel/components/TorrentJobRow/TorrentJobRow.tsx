import { type KeyboardEvent } from 'react';
import cn from 'classnames';

import type { TorrentJob } from '@/app/api/zpotify';
import cls from '@/dialogs/AddTrack/screens/components/RecentTorrentsPanel/components/TorrentJobRow/TorrentJobRow.module.css';
import { formatFileSize } from '@/shared/lib/files.ts';

interface TorrentJobRowProps {
    job: TorrentJob;
    onClick: (job: TorrentJob) => void;
}

function getStatusDotColor(status?: string): string {
    if (status === 'done') return cls.StatusDone;
    if (status === 'downloading') return cls.StatusDownloading;
    if (status === 'paused') return cls.StatusPaused;
    return cls.StatusDefault;
}

export default function TorrentJobRow({ job, onClick }: TorrentJobRowProps) {
    const total = Number(job.totalBytes ?? 0);
    const downloaded = Number(job.downloadedBytes ?? 0);
    const progress = total > 0 ? Math.min(1, downloaded / total) : 0;
    const progressPercent = `${Math.round(progress * 100)}%`;

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(job);
        }
    }

    return (
        <div className={cls.JobRow} onClick={() => onClick(job)} onKeyDown={handleKeyDown} role="button" tabIndex={0}>
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
}
