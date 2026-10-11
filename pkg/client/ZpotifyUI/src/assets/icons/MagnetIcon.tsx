interface MagnetIconProps {
    width?: number;
    height?: number;
    className?: string;
}

export default function MagnetIcon({ width = 16, height = 16, className }: MagnetIconProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M5 3h4v9a3 3 0 0 0 6 0V3h4v9a7 7 0 0 1-14 0V3Z" />
            <path d="M5 7h4" />
            <path d="M15 7h4" />
        </svg>
    );
}
