import { Button } from '@vervstack/chures';

import MusicFileIcon from '@/assets/icons/MusicFileIcon';
import { TrashIcon } from '@/assets/icons/TrashIcon.tsx';
import Checkbox from '@/components/Checkbox/Checkbox';
import cls from '@/dialogs/AddTrack/screens/components/FileItem/FileItem.module.css';
import { parseSongFilePath } from '@/dialogs/AddTrack/screens/parseSongFilePath.ts';
import type { SongFile } from '@/app/api/zpotify';

interface FileItemProps {
    file: SongFile;
    selected: boolean;
    onSelect: (f: SongFile) => void;
    onDelete: (f: SongFile) => void;
    onToggleSelect: (f: SongFile, selected: boolean) => void;
}

export default function FileItem({ file, selected, onSelect, onDelete, onToggleSelect }: FileItemProps) {
    const { fileName: name } = parseSongFilePath(file.path);

    function handleClick() {
        onSelect(file);
    }

    function handleDeleteClick(e: React.MouseEvent) {
        e.stopPropagation();
        onDelete(file);
    }

    function handleToggleClick(e: React.MouseEvent) {
        e.stopPropagation();
    }

    function handleToggleChange(checked: boolean) {
        onToggleSelect(file, checked);
    }

    return (
        <div className={cls.FileItemContainer} onClick={handleClick}>
            <div className={cls.CheckboxWrapper} onClick={handleToggleClick}>
                <Checkbox checked={selected} onChange={handleToggleChange} />
            </div>
            <div className={cls.FileIcon}>
                <MusicFileIcon width={14} height={14} />
            </div>
            <span className={cls.FileName}>{name}</span>
            <Button variant="iconDanger" aria-label={`Delete ${name}`} onClick={handleDeleteClick}>
                <TrashIcon />
            </Button>
        </div>
    );
}
