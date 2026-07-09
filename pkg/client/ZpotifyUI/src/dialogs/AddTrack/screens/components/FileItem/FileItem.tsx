import MusicFileIcon from '@/assets/icons/MusicFileIcon';
import cls from '@/dialogs/AddTrack/screens/components/FileItem/FileItem.module.css';
import type { SongFile } from '@/app/api/zpotify';

interface FileItemProps {
    file: SongFile;
    onSelect: (f: SongFile) => void;
}

export default function FileItem({ file, onSelect }: FileItemProps) {
    const name = file.path?.split('/').pop() ?? 'unknown file';

    function handleClick() {
        onSelect(file);
    }

    return (
        <div className={cls.FileItemContainer} onClick={handleClick}>
            <div className={cls.FileIcon}>
                <MusicFileIcon width={14} height={14} />
            </div>
            <span className={cls.FileName}>{name}</span>
        </div>
    );
}
