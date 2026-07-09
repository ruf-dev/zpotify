import cls from '@/assets/icons/SpinnerIcon.module.css';

export function SpinnerIcon() {
    return (
        <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <circle cx="16" cy="16" r="12" strokeOpacity="0.2" />
            <path d="M16 4a12 12 0 0 1 12 12" className={cls.Spinner} />
        </svg>
    );
}
