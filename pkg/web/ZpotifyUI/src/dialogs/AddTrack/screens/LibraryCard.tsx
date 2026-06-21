import cls from '@/dialogs/AddTrack/screens/LibraryCard.module.css';

interface LibraryCardProps {
    onClick: () => void;
}

export default function LibraryCard({ onClick }: LibraryCardProps) {
    return (
        <div className={cls.LibraryCardContainer} onClick={onClick}>
            <div className={cls.IconCircle}>
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                </svg>
            </div>
            <span className={cls.CardTitle}>pending uploads</span>
            <span className={cls.CardSubtitle}>assign an already-uploaded file</span>
        </div>
    );
}
