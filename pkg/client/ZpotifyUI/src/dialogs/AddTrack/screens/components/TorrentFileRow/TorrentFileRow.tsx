import cn from 'classnames';

import type { TorrentFileEntry } from '@/app/api/zpotify';
import cls from '@/dialogs/AddTrack/screens/components/TorrentFileRow/TorrentFileRow.module.css';
import Checkbox from '@/components/Checkbox/Checkbox';
import { formatFileBytes } from '@/shared/lib/files.ts';

interface TorrentFileRowProps {
    entry: TorrentFileEntry;
    selected: boolean;
    onToggleSelect: (path: string) => void;
}

export default function TorrentFileRow({ entry, selected, onToggleSelect }: TorrentFileRowProps) {
    const path = entry.path ?? '';
    const name = path.split('/').pop() || path;
    const supported = entry.supported === true;

    function handleChange() {
        onToggleSelect(path);
    }

    return (
        <div className={cn(cls.TorrentFileRowContainer, !supported && cls.Unsupported)}>
            <Checkbox checked={supported && selected} onChange={handleChange} disabled={!supported} />
            <span className={cls.FileName}>{name}</span>
            <span className={cls.FileSize}>{formatFileBytes(entry.sizeBytes, 0)}</span>
        </div>
    );
}
