import cls from '@/dialogs/AddTrack/screens/components/DropZoneIcon/DropZoneIcon.module.css';

interface DropZoneIconProps {
    dragOver: boolean;
}

export default function DropZoneIcon({ dragOver }: DropZoneIconProps) {
    if (dragOver) {
        return (
            <svg
                className={cls.IconDragOver}
                width="44"
                height="44"
                viewBox="0 0 44 44"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="22" cy="22" r="18" />
                <path d="M22 14v14M15 27l7 7 7-7" />
            </svg>
        );
    }
    return (
        <svg
            className={cls.IconIdle}
            width="44"
            height="44"
            viewBox="0 0 44 44"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 32V18M15 25l7-7 7 7" />
            <path d="M10 36h24" />
        </svg>
    );
}
