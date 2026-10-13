interface Props {
    className?: string;
}

export function WarningIcon({ className }: Props) {
    return (
        <svg
            className={className}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M8 2.5 14.5 13.5H1.5Z" />
            <path d="M8 6.5V9.5" />
            <path d="M8 11.75v0.01" />
        </svg>
    );
}
