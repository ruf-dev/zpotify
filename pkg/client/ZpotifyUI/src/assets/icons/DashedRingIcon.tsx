interface DashedRingIconProps {
    size: number;
    radius: number;
    strokeWidth: number;
    dashArray: string;
    className?: string;
}

export function DashedRingIcon({ size, radius, strokeWidth, dashArray, className }: DashedRingIconProps) {
    const center = size / 2;

    return (
        <svg className={className} width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
            <circle
                cx={center}
                cy={center}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                strokeLinecap="round"
            />
        </svg>
    );
}
