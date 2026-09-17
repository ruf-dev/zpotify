import type { TorrentFileRow } from '@/dialogs/TorrentManage/processes/mergeTorrentFiles';
import cls from '@/dialogs/TorrentManage/components/TorrentFileStatusList/TorrentFileStatusList.module.css';
import TorrentFileStatusRow from '@/dialogs/TorrentManage/components/TorrentFileStatusList/components/TorrentFileStatusRow/TorrentFileStatusRow';

interface TorrentFileStatusListProps {
    files: TorrentFileRow[];
}

export default function TorrentFileStatusList({ files }: TorrentFileStatusListProps) {
    return (
        <div className={cls.TorrentFileStatusListContainer}>
            {files.map((file) => (
                <TorrentFileStatusRow key={file.path} file={file} />
            ))}
        </div>
    );
}
