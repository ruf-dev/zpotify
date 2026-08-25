import { Button } from '@vervstack/chures';

import { DownloadIcon } from '@/assets/icons/DownloadIcon';
import cls from '@/dialogs/AddTrack/screens/components/TorrentJobItem/TorrentJobItem.module.css';
import { formatFileSize } from '@/shared/lib/files.ts';
import type { TorrentJob } from '@/app/api/zpotify';

interface TorrentJobItemProps {
    job: TorrentJob;
    onManage: (job: TorrentJob) => void;
}

export default function TorrentJobItem({ job, onManage }: TorrentJobItemProps) {
    const total = Number(job.totalBytes ?? 0);
    const downloaded = Number(job.downloadedBytes ?? 0);
    const progress = total > 0 ? Math.min(1, downloaded / total) : 0;
    const progressLabel = `${Math.round(progress * 100)}%`;

    function handleManageClick() {
        onManage(job);
    }

    return (
        <div className={cls.TorrentJobItemContainer}>
            <div className={cls.TorrentIcon}>
                <DownloadIcon />
            </div>
            <div className={cls.InfoWrapper}>
                <span className={cls.TorrentName}>{job.torrentName}</span>
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
            </div>
            <Button variant="ghost" className={cls.ManageButton} onClick={handleManageClick}>
                Manage
            </Button>
        </div>
    );
}
