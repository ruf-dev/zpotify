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
        <div className={cls.FileItem} onClick={handleClick}>
            <div className={cls.FileIcon}>
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                </svg>
            </div>
            <span className={cls.FileName}>{name}</span>
        </div>
    );
}
