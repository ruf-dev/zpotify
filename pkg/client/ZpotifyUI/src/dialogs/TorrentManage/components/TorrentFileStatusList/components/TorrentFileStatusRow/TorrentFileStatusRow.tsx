import cn from 'classnames';

import type { TorrentFileRow } from '@/dialogs/TorrentManage/processes/mergeTorrentFiles';
import cls from '@/dialogs/TorrentManage/components/TorrentFileStatusList/components/TorrentFileStatusRow/TorrentFileStatusRow.module.css';
import { formatFileBytes } from '@/shared/lib/files.ts';

interface TorrentFileStatusRowProps {
    file: TorrentFileRow;
}

export default function TorrentFileStatusRow({ file }: TorrentFileStatusRowProps) {
    const name = file.path.split('/').pop() || file.path;
    const failed = file.status === 'failed';
    const removed = file.status === 'ok' && file.fileDeleted;
    const total = Number(file.totalBytes ?? 0);
    const downloaded = Number(file.downloadedBytes ?? 0);
    const progress = total > 0 ? Math.min(1, downloaded / total) : 0;

    return (
        <div className={cls.TorrentFileStatusRowContainer}>
            <span className={cls.FileName}>{name}</span>
            {failed && (
                <span className={cn(cls.StatusPill, cls.StatusPillError)} title={file.error}>
                    failed
                </span>
            )}
            {removed && <span className={cn(cls.StatusPill, cls.StatusPillWarning)}>removed from library</span>}
            {!failed && !removed && (
                <>
                    <div
                        className={cls.ProgressBarTrack}
                        style={{ '--torrent-progress': String(progress) } as React.CSSProperties}
                    >
                        <div className={cls.ProgressBarFill} />
                    </div>
                    <span className={cls.FileSize}>
                        {formatFileBytes(file.downloadedBytes, 0)} / {formatFileBytes(file.totalBytes, 0)}
                    </span>
                </>
            )}
        </div>
    );
}
