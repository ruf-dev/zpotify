import cls from './ArtistChip.module.css';

export interface ArtistItem {
    id: string;
    name: string;
}

interface ArtistChipProps {
    artist: ArtistItem;
    onRemove: (id: string) => void;
    isDragging?: boolean;
    isDragOver?: boolean;
    dragHandlers?: React.DOMAttributes<HTMLSpanElement>;
}

interface LockedArtistChipProps {
    artist: ArtistItem;
}

function LockIcon() {
    return (
        <svg
            width="9"
            height="9"
            viewBox="0 0 9 9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="1.5" y="4" width="6" height="4.5" rx="0.75" />
            <path d="M3 4V2.5a1.5 1.5 0 0 1 3 0V4" />
        </svg>
    );
}

function RemoveIcon() {
    return (
        <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
        >
            <line x1="1" y1="1" x2="7" y2="7" />
            <line x1="7" y1="1" x2="1" y2="7" />
        </svg>
    );
}

export function ArtistChip({ artist, onRemove, isDragging, isDragOver, dragHandlers }: ArtistChipProps) {
    function handleRemoveClick(e: React.MouseEvent) {
        e.stopPropagation();
        onRemove(artist.id);
    }

    return (
        <span
            className={`${cls.Chip} ${isDragging ? cls.ChipDragging : ''} ${isDragOver ? cls.ChipDragOver : ''}`}
            {...dragHandlers}
        >
            <span className={cls.ChipName}>{artist.name}</span>
            <span className={cls.RemoveBtn} onClick={handleRemoveClick} aria-label={`remove ${artist.name}`}>
                <RemoveIcon />
            </span>
        </span>
    );
}

export function LockedArtistChip({ artist }: LockedArtistChipProps) {
    return (
        <span className={cls.LockedChip}>
            <span className={cls.LockIcon}>
                <LockIcon />
            </span>
            <span className={cls.ChipName}>{artist.name}</span>
        </span>
    );
}
