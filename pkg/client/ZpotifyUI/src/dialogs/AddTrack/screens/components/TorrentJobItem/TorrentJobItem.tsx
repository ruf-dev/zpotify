import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import { Button } from '@vervstack/chures';
import cn from 'classnames';

import { DownloadIcon } from '@/assets/icons/DownloadIcon';
import cls from '@/dialogs/AddTrack/screens/components/TorrentJobItem/TorrentJobItem.module.css';
import { formatFileSize } from '@/shared/lib/files.ts';
import TorrentFileProgressList from '@/components/TorrentFileProgressList/TorrentFileProgressList';
import type { TorrentJob } from '@/app/api/zpotify';

interface TorrentJobItemProps {
    job: TorrentJob;
    onManage: (job: TorrentJob) => void;
}

export default function TorrentJobItem({ job, onManage }: TorrentJobItemProps) {
    const [expanded, setExpanded] = useState(false);

    const total = Number(job.totalBytes ?? 0);
    const downloaded = Number(job.downloadedBytes ?? 0);
    const progress = total > 0 ? Math.min(1, downloaded / total) : 0;
    const progressLabel = `${Math.round(progress * 100)}%`;
    const files = job.files ?? [];
    const hasFileList = files.length > 1;

    function handleRowClick() {
        setExpanded((prev) => !prev);
    }

    function handleManageButtonClick(e: MouseEvent) {
        e.stopPropagation();
        onManage(job);
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleRowClick();
        }
    }

    const rowProps = hasFileList
        ? {
              onClick: handleRowClick,
              onKeyDown: handleKeyDown,
              role: 'button' as const,
              'aria-expanded': expanded,
              tabIndex: 0,
          }
        : {};

    return (
        <div className={cn(cls.TorrentJobItemContainer, hasFileList && cls.Expandable)} {...rowProps}>
            <div className={cls.TopRow}>
                <div className={cls.TorrentIcon}>
                    <DownloadIcon />
                </div>
                <span className={cls.TorrentName}>{job.torrentName}</span>
                <Button variant="ghost" className={cls.ManageButton} onClick={handleManageButtonClick}>
                    Manage
                </Button>
            </div>
            <div
                className={cls.ProgressBarTrack}
                style={{ '--torrent-progress': String(progress) } as React.CSSProperties}
            >
                <div className={cls.ProgressBarFill} />
            </div>
            <div className={cls.MetaRow}>
                <span className={cls.StatusLabel}>{job.status}</span>
                <span className={cls.ProgressLabel}>
                    {formatFileSize(downloaded)} / {formatFileSize(total)} ({progressLabel})
                </span>
            </div>
            {job.error && <span className={cls.ErrorLabel}>{job.error}</span>}
            {hasFileList && (
                <div className={cn(cls.FileProgressWrapper, expanded && cls.FileProgressExpanded)}>
                    <TorrentFileProgressList files={files} className={cls.FileProgressList} />
                </div>
            )}
        </div>
    );
}
