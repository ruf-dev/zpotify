import { type KeyboardEvent, type MouseEvent } from 'react';
import cn from 'classnames';
import { Button } from '@vervstack/chures';

import type { TorrentJob } from '@/app/api/zpotify';
import cls from '@/dialogs/AddTrack/screens/components/RecentTorrentsPanel/components/TorrentJobRow/TorrentJobRow.module.css';
import { formatFileSize } from '@/shared/lib/files.ts';
import MagnetIcon from '@/assets/icons/MagnetIcon';

interface TorrentJobRowProps {
    job: TorrentJob;
    onClick: (job: TorrentJob) => void;
    onCopyMagnet: (job: TorrentJob) => void;
}

function getStatusDotColor(status?: string): string {
    if (status === 'done') return cls.StatusDone;
    if (status === 'downloading') return cls.StatusDownloading;
    if (status === 'paused') return cls.StatusPaused;
    return cls.StatusDefault;
}

export default function TorrentJobRow({ job, onClick, onCopyMagnet }: TorrentJobRowProps) {
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

    function handleCopyMagnetClick(e: MouseEvent) {
        e.stopPropagation();
        onCopyMagnet(job);
    }

    function handleCopyMagnetKeyDown(e: KeyboardEvent) {
        e.stopPropagation();
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

            <Button
                variant="ghost"
                className={cls.CopyMagnetButton}
                onClick={handleCopyMagnetClick}
                onKeyDown={handleCopyMagnetKeyDown}
                aria-label="copy magnet"
            >
                <MagnetIcon width={16} height={16} />
            </Button>
        </div>
    );
}
