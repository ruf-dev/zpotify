import type { TorrentFileProgress } from '@/app/api/zpotify';
import cls from '@/components/TorrentFileProgressList/components/TorrentFileProgressRow/TorrentFileProgressRow.module.css';
import { formatFileBytes } from '@/shared/lib/files.ts';

interface TorrentFileProgressRowProps {
    file: TorrentFileProgress;
}

export default function TorrentFileProgressRow({ file }: TorrentFileProgressRowProps) {
    const total = Number(file.totalBytes ?? 0);
    const downloaded = Number(file.downloadedBytes ?? 0);
    const progress = total > 0 ? Math.min(1, downloaded / total) : 0;
    const path = file.path ?? '';
    const name = path.split('/').pop() || path;

    return (
        <div className={cls.TorrentFileProgressRowContainer}>
            <span className={cls.FileName}>{name}</span>
            <div
                className={cls.ProgressBarTrack}
                style={{ '--torrent-progress': String(progress) } as React.CSSProperties}
            >
                <div className={cls.ProgressBarFill} />
            </div>
            <span className={cls.FileSize}>
                {formatFileBytes(file.downloadedBytes, 0)} / {formatFileBytes(file.totalBytes, 0)}
            </span>
        </div>
    );
}
