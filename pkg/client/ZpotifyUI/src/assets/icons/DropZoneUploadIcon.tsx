interface DropZoneUploadIconProps {
    className?: string;
}

export function DropZoneUploadIcon({ className }: DropZoneUploadIconProps) {
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
            <path d="M22 32V18M15 25l7-7 7 7" />
            <path d="M10 36h24" />
        </svg>
    );
}
