interface PlusIconProps {
    open?: boolean;
}

export function PlusIcon({ open }: PlusIconProps) {
    return (
        <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
        >
            {open ? (
                <>
                    <line x1="1" y1="1" x2="9" y2="9" />
                    <line x1="9" y1="1" x2="1" y2="9" />
                </>
            ) : (
                <>
                    <line x1="5" y1="1" x2="5" y2="9" />
                    <line x1="1" y1="5" x2="9" y2="5" />
                </>
            )}
        </svg>
    );
}
