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

    function handleRowClick() {
        if (!supported) {
            return;
        }
        onToggleSelect(path);
    }

    function handleCheckboxAreaClick(e: React.MouseEvent) {
        e.stopPropagation();
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key !== 'Enter' && e.key !== ' ') {
            return;
        }
        e.preventDefault();
        handleRowClick();
    }

    return (
        <div
            className={cn(cls.TorrentFileRowContainer, !supported && cls.Unsupported)}
            onClick={handleRowClick}
            onKeyDown={handleKeyDown}
            role="checkbox"
            aria-checked={supported && selected}
            aria-disabled={!supported}
            tabIndex={supported ? 0 : -1}
            title={supported ? undefined : 'Unsupported file type — cannot be downloaded'}
        >
            <span onClick={handleCheckboxAreaClick}>
                <Checkbox checked={supported && selected} onChange={handleRowClick} disabled={!supported} />
            </span>
            <span className={cls.FileName}>{name}</span>
            <span className={cls.FileSize}>{formatFileBytes(entry.sizeBytes, 0)}</span>
        </div>
    );
}
