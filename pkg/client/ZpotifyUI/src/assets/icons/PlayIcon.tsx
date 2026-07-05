interface PlayIconProps {
    width?: number;
    height?: number;
    className?: string;
}

export default function PlayIcon({ width = 13, height = 13, className }: PlayIconProps) {
    return (
        <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21" />
        </svg>
    );
}
