import cn from 'classnames';

import type { TorrentFileProgress } from '@/app/api/zpotify';
import cls from '@/components/TorrentFileProgressList/TorrentFileProgressList.module.css';
import TorrentFileProgressRow from '@/components/TorrentFileProgressList/components/TorrentFileProgressRow/TorrentFileProgressRow';

interface TorrentFileProgressListProps {
    files: TorrentFileProgress[];
    className?: string;
}

export default function TorrentFileProgressList({ files, className }: TorrentFileProgressListProps) {
    return (
        <div className={cn(cls.TorrentFileProgressListContainer, className)}>
            {files.map((file) => (
                <TorrentFileProgressRow key={file.path} file={file} />
            ))}
        </div>
    );
}
