interface DropZoneTargetIconProps {
    className?: string;
}

export function DropZoneTargetIcon({ className }: DropZoneTargetIconProps) {
    return (
        <svg
            className={className}
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
