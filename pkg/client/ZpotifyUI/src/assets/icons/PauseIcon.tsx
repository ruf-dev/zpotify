interface PauseIconProps {
    width?: number;
    height?: number;
    className?: string;
}

export default function PauseIcon({ width = 13, height = 13, className }: PauseIconProps) {
    return (
        <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
            <rect x="5" y="3" width="5" height="18" rx="1" />
            <rect x="14" y="3" width="5" height="18" rx="1" />
        </svg>
    );
}
